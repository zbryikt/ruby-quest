t1 = Date.now!
require! <[fs path yargs template sharedb-wrapper express ./api]>

root = path.join(path.dirname(fs.realpathSync __filename.replace(/\(js\)$/,'')), '..')

config = do
  pg: do
    uri: "postgres://pg:pg@#{process.env.DB_HOST or \localhost}/pg"
    database: "pg"
    user: "pg"
    password: "pg"
    host: "#{process.env.DB_HOST or \localhost}"
    port: "#{process.env.DB_PORT or 25432}"

server = do
  init: ->
    @app = app = express!
    cwd = process.cwd!
    {server,sdb,connect,wss} = sharedb-wrapper {app, io: config.pg}
    app.engine 'pug', template.view
    app.set 'view engine', 'pug'
    app.set 'views', path.join(cwd, './src/pug/')
    app.locals.viewdir = path.join(cwd, './.view/')
    app.locals.basedir = app.get \views
    app.set 'view engine', \pug
    app.use \/, express.static \static
    console.log "[Server] Express Initialized in #{app.get \env} Mode".green
    server.listen opt.port, ->
      delta = if opt.start-time => "( takes #{Date.now! - opt.start-time}ms )" else ''
      console.log "[SERVER] listening on port #{server.address!port} #delta".cyan

opt = {start-time: t1, port: 5200}

process.chdir path.join(root, 'web')

server.init opt
template.watch.init opt
