require! <[fs path]>

({app}) <- (-> module.exports = it) _

root = path.join(path.dirname(fs.realpathSync __filename.replace(/\(js\)$/,'')), '..', '..', 'web/static/assets/map')

app.get \/api/mapset, (req, res) ->
  mapsets = fs.readdir-sync root
    .map -> path.join root, it
    .filter -> fs.stat-sync it .is-directory!
  res.send mapsets

app.get \/api/mapset/:mapset, (req, res) ->
  index = path.join(root, req.params.mapset, 'index.json')
  if fs.exists-sync(index) => data = JSON.parse(fs.read-file-sync(index).toString! or {})
  else
    fs.mkdir-sync path.join(root, req.params.mapset)
    data = {}
  res.send data

app.get \/api/mapset/:mapset/:id, (req, res) ->
  index = path.join(root, req.params.mapset, 'index.json')
  meta = fs.read-file-sync(index).toString!
  id = +req.params.id
  fn = path.join(root, req.params.mapset, "#{meta.levels[id].name}.json")
  data = if fs.exist-sync fn => fs.read-file-sync fn .toString!
  else do
    user: {x: 0, y: 0, f: 0}
    tiles: [
      for i from 0 til 10 => for j from 0 til 10 => \a
    ]
  res.send data

app.put \/api/mapset/:mapset/:id, (req, res) ->
  index = path.join(root, req.params.mapset, 'index.json')
  meta = fs.read-file-sync(index).toString!
  id = +req.params.id
  entry = {name: Math.random!toString(36).substring(2)} <<< (meta.{}levels{}[id] or {})
  fn = path.join(root, req.params.mapset, "#{entry.name}.json")
  fs.write-file-sync fn, JSON.stringify(req.body.data)
  meta.levels[id] = entry
  fs.write-file-sync(index, JSON.stringify(meta))
  res.send!

  res.send!
