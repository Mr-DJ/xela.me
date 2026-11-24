#!/usr/bin/env node

// Adapted from https://github.com/hashicorp/next-remote-watch
// A copy of next-remote-watch with an additional ws reload emitter.
// The app listens to the event and triggers a client-side router refresh
// see components/ClientReload.js

import { spawn } from 'node:child_process'
import fs from 'node:fs'
import http from 'node:http'
import path from 'node:path'
import { parse } from 'node:url'

import chokidar from 'chokidar'
import { Command } from 'commander'
import next from 'next'
import { Server as SocketServer } from 'socket.io'

const defaultWatchEvent = 'change'
const pkg = JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8'))

const program = new Command()
program
  .name('next-remote-watch')
  .description('Watch remote content and refresh the Next.js dev server')
  .version(pkg.version)
  .argument('[paths...]', 'files or directories to watch')
  .option('-r, --root <dir>', 'root directory of your nextjs app')
  .option('-s, --script [path]', 'path to the script you want to trigger on a watcher event', false)
  .option('-c, --command [cmd]', 'command to execute on a watcher event', false)
  .option('-e, --event [name]', 'name of event to watch', defaultWatchEvent)
  .option('-p, --polling [name]', 'use polling for the watcher', false)
  .parse(process.argv)

const options = program.opts()
const shell = process.env.SHELL
const app = next({ dev: true, dir: options.root || process.cwd() })
const port = Number.parseInt(process.env.PORT, 10) || 3000
const handle = app.getRequestHandler()

const readJsonBody = (req, limit = 1024 * 1024) =>
  new Promise((resolve) => {
    let body = ''

    req.on('data', (chunk) => {
      body += chunk
      if (body.length > limit) {
        req.destroy()
        resolve(null)
      }
    })
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {})
      } catch {
        resolve(null)
      }
    })
    req.on('error', () => resolve(null))
  })

await app.prepare()

// create the http + socket.io server
const server = http.createServer(async (req, res) => {
  if (req.url?.startsWith('/__next_reload')) {
    const body = await readJsonBody(req)

    if (!body) {
      res.statusCode = 400
      res.end('Invalid JSON body')
      return
    }

    // log message if present
    const msg = body.message
    msg && console.log(msg)

    // reload the nextjs app
    io.emit('reload', '/__next_reload')
    res.end('Reload initiated')
    return
  }

  try {
    await handle(req, res, parse(req.url, true))
  } catch (error) {
    console.error(error)
    res.statusCode = 500
    res.end('Internal server error')
  }
})

const io = new SocketServer(server)

// if directories are provided, watch them for changes and trigger reload
if (program.args.length > 0) {
  chokidar
    .watch(program.args, { usePolling: Boolean(options.polling) })
    .on(options.event, async (filePathContext, eventContext = defaultWatchEvent) => {
      // Emit changes via socketio; ClientReload refreshes the current route.
      io.emit('reload', filePathContext)

      if (options.command) {
        // Use spawn here so that we can pipe stdio from the command without buffering
        spawn(
          shell,
          [
            '-c',
            options.command
              .replace(/\{event\}/gi, filePathContext)
              .replace(/\{path\}/gi, eventContext),
          ],
          {
            stdio: 'inherit',
          }
        )
      }

      if (options.script) {
        try {
          // find the path of your --script script
          const scriptPath = path.join(process.cwd(), options.script.toString())

          // import your --script script
          const { default: executeFile } = await import(scriptPath)

          // run the exported function from your --script script
          executeFile(filePathContext, eventContext)
        } catch (e) {
          console.error('Remote script failed')
          console.error(e)
          return e
        }
      }
    })
}

// fire it up
server.listen(port, (err) => {
  if (err) throw err
  console.log(`> Ready on http://localhost:${port}`)
})
