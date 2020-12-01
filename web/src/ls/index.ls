cp = -> JSON.parse(JSON.stringify(it))

stage = ->
  @data = {}
  @dim = {}
  @user = {item: []}
  @cursor = {key: \c}
  @lv = 0
  @loader = {}
  @ldcv = {}
  @snd = {}
  @mode = \intro
  @

stage.dim = do
  size: 32
  vp: 12

stage.tileinfo = do
  a: name: \void,           through: true,  over: false, fill: true,  push: true
  b: name: \bedrock,        through: false, over: true,  fill: false, push: false
  c: name: \earth,          through: false, over: true,  fill: false, push: false
  d: name: \wall,           through: false, over: true,  fill: false, push: false
  e: name: \stool,          through: false, over: true,  fill: false, push: false
  f: name: \grass,          through: false, over: false, fill: true,  push: false
  g: name: \door,           through: true,  over: false, fill: false, push: false
  h: name: \key,            through: true,  over: false, fill: false, push: false
  i: name: \exit,           through: true,  over: false, fill: false, push: false
  j: name: \stair,          through: true,  over: false, fill: false, push: false
  k: name: \gravel,         through: true,  over: false, fill: false, push: false
  l: name: \sapphire,       through: true,  over: false, fill: false, push: false, score: 10
  m: name: \button,         through: true,  over: false, fill: false, push: false
  n: name: \button-pressed, through: true,  over: false, fill: true,  push: false
  o: name: \trapwall,      through: true,  over: false,  fill: true, push: false
  p: name: \trapdoor,      through: false,  over: true,  fill: false, push: false


stage.prototype = Object.create(Object.prototype) <<< do
  restart: ->
    @user.score = @user.start-score
    @load {lv: @lv}
  reset: ->
    @user.score = 0
    @load {lv: 1}
  snd-pause: (n) ->
    @snd[n].pause!
  snd-play: (n,opt = {}) ->
    if opt.loop => @snd[n].loop = true
    @snd[n].currentTime = 0
    @snd[n].play!
  set-mode: (mode = \edit) ->
    if mode == \edit =>
      if @edit-data =>
        @data = cp(@edit-data)
        @tiles = @data.tiles
        @users = @data.users
      @mode = \edit
      @snd-pause \bgm
      @render!
    else if mode == \intro
      @mode = \intro
      @snd-pause \bgm
      @render!
    else
      @user <<< @data.user
      @mode = \play
      @render!

  init: ->
    @view = view = new ldView do
      init-render: false
      root: document.body
      init: do
        finish: ({node}) ~> @ldcv.finish = new ldCover {root: node}
        picked: ({node}) ~> node.appendChild @el.sample-tile.cloneNode true
      text:
        lv: ~> @lv or 1
        score: ~> @user.score or 0
      handler:
        mapset: do
          list: -> <[basic]>
          key: -> it
          handler: ({node, data}) ->
            node.innerText = data
            node.value = data

        "on-mode": ({node}) ~>
          mode = node.getAttribute \data-mode
          node.classList.toggle \d-none, (mode != @mode)

        "sample-tile": (->), field: (->), user: (->), cursor: (->)
        scene: (->), lv: (->), score: (->)
        picked: ({node}) ~>
          node.childNodes.0.setAttribute \class, (<[tile]> ++ [stage.tileinfo[@cursor.key].name]).join(' ')
        screen: ({node}) ~>
          n = node.getAttribute(\data-name).split(' ')
          node.classList.toggle \d-none, !(@mode in n)

      action: click:
        start: ~>
          @set-mode \play
          _ = (name) ~>
            @load {lv: 1, path: (-> "/assets/map/#name/#it.json")}
          _ view.get('selected-mapset').value
        "go-edit": ~> @set-mode \edit
        "test-run": ~>
          @edit-data = cp @data
          @set-mode \play
        "download": ~>
          href = URL.createObjectURL(new Blob([JSON.stringify(@data)], {type: \application/json}))
          n = ld$.create name: \a, attr: {href,download: 'result.json'}
          document.body.appendChild n
          n.click!
          document.body.removeChild n
        restart: ~> @restart!
        reset: ~>
          @ldcv.finish.toggle false
          @reset!
        ext: ({node}) ~>
          type = +node.getAttribute(\data-type)
          if type == 0 => @tiles.map -> it.map -> it.splice(0,0,cp it[0])
          if type == 1 => @tiles.map -> it.splice(0,0,cp it[0])
          if type == 2 => @tiles.map -> it.map -> it.splice(it.length,0,cp it[* - 1])
          if type == 3 => @tiles.map -> it.splice(it.length,0,cp it[* - 1])
          if type == 4 => @tiles.map -> it.map -> it.splice 0, 1
          if type == 5 => @tiles.map -> it.splice 0, 1
          if type == 6 => @tiles.map -> it.map -> it.splice it.length - 1, 1
          if type == 7 => @tiles.map -> it.splice it.length - 1, 1
          if type == 8 => @tiles.splice @tiles.length, 0, (@tiles[* - 1].map -> it.map -> \a)
          if type == 9 => @tiles.splice 0, 0, cp @tiles[0]
          if type == 10 and @tiles.length > 1 => @tiles.splice @tiles.length - 1, 1
          if type == 11 and @tiles.length > 1 => @tiles.splice 0, 1
          @prepare!
          @render!


    @el = do
      sample-tile: view.get(\sample-tile).cloneNode(true)
      scene: view.get \scene
      field: view.get \field
      user: view.get \user
      cursor: view.get \cursor
      picked: view.get \picked
    @el.sample-tile.classList.remove \d-none
    @view.render!

    @snd.bgm = new Audio('/assets/snd/adventure.mp3')
    @snd.get = new Audio('/assets/snd/get.ogg')
    @snd.pass = new Audio('/assets/snd/pass.ogg')
    @snd.key = new Audio('/assets/snd/key.ogg')
    @snd.push = new Audio('/assets/snd/push.ogg')
    @snd.hit = new Audio('/assets/snd/hit.ogg')

    requestAnimationFrame (t) ~> @firekey t
    document.addEventListener \keyup, (e) ~>
      keycode = e.which
      if keycode == 32 => @cursor.entering = false
      if keycode < 37 or keycode > 40 => return
      u = @user
      dir = keycode - 37
      if u.dir == dir => u.moving = false
    document.addEventListener \keydown, (e) ~>
      [u,keycode] = [@user, e.which]
      if @snd.bgm.paused and @mode == \play => @snd-play \bgm, {loop: true}
      if keycode == 82 and @mode == \play => return @restart!
      if @mode == \edit =>
        if keycode == 80 =>
          @data.user <<< @user{x,y,f}
          @render-user!
        if keycode in [83, 87] =>
          delta = if keycode == 83 => -1 else 1
          u.f = (u.f + delta) >? 0
          if u.f >= @dim.f => u.f = @dim.f - 1
          if !@tiles[u.f] => @tiles[u.f] = for i from 0 til @dim.h => for j from 0 til @dim.w => \a
          @render!
        if keycode in [65, 68] =>
          ks = [k for k of stage.tileinfo]
          delta = if keycode == 65 => -1 else 1
          @cursor.key = ks[(ks.indexOf(@cursor.key) + delta + ks.length) % ks.length]
          @render-user!
        if keycode == 8 =>
          @tiles[u.f][u.y][u.x] = \a
          @render!
        if keycode == 32 =>
          @cursor.entering = true
          @tiles[u.f][u.y][u.x] = @cursor.key
          @render!
        if keycode == 70 =>
          @tiles[u.f].map ~> for i from 0 til it.length => it[i] = @cursor.key
          @render!

      if keycode < 37 or keycode > 40 => return
      dir = keycode - 37
      if u.dir != dir or !u.moving => u.last-move-time = null
      u <<< dir: dir, moving: true
      @el.user.style.backgroundPositionY = "#{-stage.dim.size * 1.4964 * ([2 1 3 0][dir])}px"


  z-index: ({x,y,f,p}) -> (f * @dim.w * @dim.h + y) * 2 + (if p => 1 else 0)
  render-user: ->
    [block-size,block-vp] = [stage.dim.size, stage.dim.vp]
    {x,y,f} = if @mode == \play => @user else @data.user
    @el.user.style <<< do
      left: "#{x * block-size}px"
      top: "#{y * block-size - f * block-vp}px"
      z-index: @z-index({f: f, y: y, x: x, p: 1})

    @el.cursor.style <<< do
      left: "#{@user.x * block-size}px"
      top: "#{@user.y * block-size - @user.f * block-vp}px"
      z-index: @z-index({f: @user.f, y: @user.y, x: @user.x, p: 1})
    @el.cursor.style.display = if @mode == \edit => \block else \none
    @view.render \picked

  render: ->
    [dim,tiles,tileinfo] = [@dim, @tiles, stage.tileinfo]
    [block-size,block-vp] = [stage.dim.size, stage.dim.vp]
    [sample,field,scene] = [@el.sample-tile, @el.field, @el.scene]
    scene.style <<< do
      width: "#{dim.w * block-size}px"
      height: "#{dim.h * block-size + block-vp}px"
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
    @view.render!

  prepare: ->
    @tiles = @data.tiles
    @user <<< @data.user
    @dim <<< do
      f: @data.tiles.length
      h: @data.tiles.0.length
      w: @data.tiles.0.0.length

  edit: ->
    @mode = \edit
    @data = do
      user: {x: 0, y: 0, f: 0}
      tiles: [
        for i from 0 til 10 => for j from 0 til 10 => \a
      ]
    @prepare!
    @render!

  load: ({lv, path, mode}) ->
    path = if path => path else @loader.path 
    @loader.path = path
    ld$.fetch (if path => path(lv) else "/js/map/#lv.js"), {}, {type: \text}
      .then (ret) ~>
        try
          @data = JSON.parse(ret)
        catch e
          @data = eval(ret)
        @lv = lv
        @user.start-score = @user.score
        @prepare!
        @set-mode (mode or \play)
      .catch ~>
        @ldcv.finish.toggle true


  convert: ({x, y, f, src, des}) ->
    @tiles[f][y][x] = des
    @nodes[f][y][x].classList.remove stage.tileinfo[src].name
    @nodes[f][y][x].classList.add stage.tileinfo[des].name

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

  prepare = ~>
    p = [
      p0 = x: u.x, y: u.y
      p1 = pd = x: u.x + dx, y: u.y + dy, f: u.f
      p2 = x: u.x + 2 * dx, y: u.y + 2 * dy
    ]
    f = [u.f - 1, u.f, u.f + 1]
    if p1.x < 0 or p1.x >= @dim.w or p1.y < 0 or p1.y >= @dim.h or f.1 < 0 or f.1 >= @dim.f => return []
    ts = for i from 0 til 3 => for d from 0 til 3 =>
      [cx,cy,cf] = [p[d].x, p[d].y, f[i]]
      if cx < 0 or cx >= @dim.w or cy < 0 or cy >= @dim.h or cf < 0 or cf >= @dim.f => 0
      else if !@tiles[cf] => 0
      else @tiles[cf][cy][cx]
    return [p,f,ts,p0,p1,p2,pd]
  [p,f,ts,p0,p1,p2,pd] = prepare!
  if !p => return
  if @mode == \edit =>
    u <<< pd
    if @cursor.entering =>
      @tiles[u.f][u.y][u.x] = @cursor.key
      @render!
    else @render-user!
    return

  if ts.1.0 in <[j]> and
  (tileinfo[ts.1.1] and tileinfo[ts.1.1].over) and
  (!(tileinfo[ts.2.1]) or tileinfo[ts.2.1].through) =>
    u.f = u.f + 1
    [p,f,ts,p0,p1,p2,pd] = prepare!
    if !p => return

  if tileinfo[ts.1.1] and tileinfo[ts.1.1].score =>
    @tiles[f.1][p1.y][p1.x] = \a
    n = @nodes[f.1][p1.y][p1.x]
    if n and n.parentNode => n.parentNode.removeChild(n)
    @nodes[f.1][p1.y][p1.x] = null
    @user.score = (@user.score or 0) + (tileinfo[ts.1.1].score)
    @snd-play \get
    @view.render!

  # button
  if ts.1.1 in <[m]> =>
    @transform({src: \o, des: \d})
    @transform({src: \p, des: \a})
    @convert({f: f.1, x: p1.x, y: p1.y, src: \m, des: \n})
    @render!

  # stool
  if ts.1.1 in <[e]> =>
    # obstacle in stool destination
    if !(ts.1.2 in <[a f n o]>) =>
      @snd-play \hit
      return
    # df - destination floor. dk - destination key
    [df,dk] = if f.0 >= 0 and (!tileinfo[ts.0.2] or tileinfo[ts.0.2].fill) => [f.0,\c] else [f.1, \e]
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
    @snd-play \push
    apply-default = false

  if ts.1.1 in <[h]> => 
    @snd-play \key
    @transform({src: \g, des: \i})
    @user.item.push 7
    @tiles[f.1][p1.y][p1.x] = \a
    n = @nodes[f.1][p1.y][p1.x]
    if n and n.parentNode => n.parentNode.removeChild n
    @nodes[f.1][p1.y][p1.x] = null

  if ts.1.1 in <[i]> =>
    @snd-play \pass
    if @edit-data => @set-mode \edit
    else return @load {lv: @lv + 1}

  if ts.1.1 in <[a]> and ts.0.1 in <[j]> =>
    pd.f = pd.f - 1
    apply-default = false


  # default handler
  if apply-default => 
    if tileinfo[ts.1.1] and !tileinfo[ts.1.1].through => return
    if tileinfo[ts.0.1] and !tileinfo[ts.0.1].over => return
  
  u <<< pd
  @render-user!

s = new stage!
s.init!
#s.load {lv: 1, path: (-> "/assets/map/basic/#it.json")}
#s.edit!
