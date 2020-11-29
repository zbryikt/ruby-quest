stage = ->
  @data = {}
  @dim = {}
  @user = {item: []}
  @

stage.dim = do
  size: 32
  vp: 12

stage.tileinfo = do
  a: name: \void,     through: true,  over: false, fill: true,  push: true
  b: name: \bedrock,  through: false, over: true,  fill: false, push: false
  c: name: \earth,    through: false, over: true,  fill: false, push: false
  d: name: \wall,     through: false, over: true,  fill: false, push: false
  e: name: \stool,    through: false, over: true,  fill: false, push: false
  f: name: \grass,    through: false, over: false, fill: true,  push: false
  g: name: \door,     through: true,  over: false, fill: false, push: false
  h: name: \key,      through: true,  over: false, fill: false, push: false
  i: name: \exit,     through: true,  over: false, fill: false, push: false
  j: name: \stair,    through: true,  over: false, fill: false, push: false
  k: name: \gravel,   through: true,  over: false, fill: false, push: false
  l: name: \sapphire, through: true,  over: false, fill: false, push: false


stage.prototype = Object.create(Object.prototype) <<< do
  init: ->
    view = new ldView do
      root: document.body
      handler: "sample-tile": (->), field: (->), user: (->), scene: (->)
    @el = do
      sample-tile: view.get(\sample-tile).cloneNode(true)
      scene: view.get \scene
      field: view.get \field
      user: view.get \user
    @el.sample-tile.classList.remove \d-none

    requestAnimationFrame (t) ~> @firekey t
    document.addEventListener \keyup, (e) ~>
      if e.key < 37 or e.key > 40 => return
      u = @user
      dir = e.which - 37
      if u.dir == dir => u.moving = false
    document.addEventListener \keydown, (e) ~>
      if e.key < 37 or e.key > 40 => return
      u= @user
      dir = e.which - 37
      if u.dir != dir or !u.moving => u.last-move-time = null
      u <<< dir: dir, moving: true


  z-index: ({x,y,f,p}) -> (f * @dim.w * @dim.h + y) * 2 + (if p => 1 else 0)

  render-user: ->
    [block-size,block-vp] = [stage.dim.size, stage.dim.vp]
    @el.user.style <<< do
      left: "#{@user.x * block-size}px"
      top: "#{@user.y * block-size - @user.f * block-vp}px"
      z-index: @z-index({f: @user.f, y: @user.y, x: @user.x, p: 1})

  render: ->
    [dim,tiles,tileinfo] = [@dim, @tiles, stage.tileinfo]
    [block-size,block-vp] = [stage.dim.size, stage.dim.vp]
    [sample,field,scene] = [@el.sample-tile, @el.field, @el.scene]
    scene.style <<< do
      width: "#{dim.w * block-size}px"
      height: "#{dim.h * block-size + block-vp * dim.f}px"

    field.innerHTML = ""
    @nodes = []
    @nodes = for f from 0 til dim.f =>
      for h from 0 til dim.h =>
        for w from 0 til dim.w =>
           n = sample.cloneNode(true)
           field.appendChild(n)
           n.classList.add tileinfo[tiles[f][h][w]].name
           n.style <<< do
             left: "#{w * block-size}px"
             top: "#{h * block-size - f * block-vp}px"
             z-index: @z-index {f, x: w, y: h, p: 0}
           n
    @render-user!

  load: ({lv}) ->
    ld$.fetch "/js/map/#lv.js", {}, {type: \text}
      .then (ret) ~>
        @data = eval(ret)
        @tiles = @data.tiles
        @user <<< @data.user
        @dim <<< do
          f: @data.tiles.length
          h: @data.tiles.0.length
          w: @data.tiles.0.0.length
        @render!
  transform: ({src,des}) ->
    [tiles,nodes,tileinfo,dim] = [@tiles,@nodes,stage.tileinfo,@dim]
    for f from 0 til dim.f => for h from 0 til dim.h => for w from 0 til dim.w =>
      if !(tiles[f][h][w] in [src]) => continue
      tiles[f][h][w] = des
      nodes[f][h][w].classList.remove tileinfo[src].name
      nodes[f][h][w].classList.add tileinfo[des].name


stage.prototype.firekey = (t) ->
  [tileinfo,u,apply-default] = [stage.tileinfo, @user, true]
  [block-size,block-vp] = [stage.dim.size, stage.dim.vp]
  requestAnimationFrame (t) ~> @firekey t
  if !u.moving or (u.last-move-time and (t - u.last-move-time) < 100) => return 

  u.last-move-time = t
  [dx, dy] = switch u.dir
  | 0 => [-1,  0]
  | 1 => [ 0, -1]
  | 2 => [ 1,  0]
  | 3 => [ 0,  1]
  | otherwise => [NaN,NaN]
  if isNaN(dx) => return
  p = [
    p0 = x: u.x, y: u.y
    p1 = x: u.x + dx, y: u.y + dy
    p2 = x: u.x + 2 * dx, y: u.y + 2 * dy
  ]
  f = [u.f - 1, u.f, u.f + 1]
  if p1.x < 0 or p1.x >= @dim.w or p1.y < 0 or p1.y >= @dim.h or f.1 <0 or f.1 >= @dim.f => return

  ts = for i from 0 til 3 => for d from 0 til 3 =>
    [cx,cy,cf] = [p[d].x, p[d].y, f[i]]
    if cx < 0 or cx >= @dim.w or cy < 0 or cy >= @dim.h or cf < 0 or cf >= @dim.f => 0
    else if !@tiles[cf] => 0
    else @tiles[cf][cy][cx]

  # stool
  if ts.1.1 in <[e]> =>
    # obstacle in stool destination
    if !(ts.1.2 in <[a f]>) => return
    # df - destination floor. dk - destination key
    [df,dk] = if !tileinfo[ts.0.2] or tileinfo[ts.0.2].fill => [f.0,\c] else [f.1, \e]
    @tiles[f.1][p1.y][p1.x] = \a
    @tiles[df][p2.y][p2.x] = dk
    @nodes[f.1][p1.y][p1.x].classList.remove tileinfo.e.name
    @nodes[f.1][p1.y][p1.x].classList.add tileinfo[dk]name
    @nodes[f.1][p1.y][p1.x].style <<< do
      left: "#{(p2.x) * block-size}px"
      top: "#{(p2.y) * block-size - df * block-vp}px"
      z-index: @z-index({f: df, y: p2.y, x: p2.x, p: 0})
    if @nodes[df][p2.y][p2.x] => that.parentNode.removeChild that
    @nodes[df][p2.y][p2.x] = @nodes[f.1][p1.y][p1.x]
    @nodes[f.1][p1.y][p1.x] = null
    apply-default = false

  if ts.1.1 in <[h]> => 
    @transform({src: \g, des: \i})
    @user.item.push 7
    @tiles[f.1][p1.y][p1.x] = 0
    n = @nodes[f.1][p1.y][p1.x]
    if n and n.parentNode => n.parentNode.removeChild n

  # default handler
  if apply-default => 
    if tileinfo[ts.1.1] and !tileinfo[ts.1.1].through => return
    #if state.tiles[nf][my][mx] in [0 5] and (!(state.tiles[nf - 1]) or !(state.tiles[nf - 1][my][mx] in [9])) => 
  
  u <<< p1
  @render-user!






s = new stage!
s.init!
s.load {lv: 1}
