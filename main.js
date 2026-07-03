const state =
  window.__MASTER_STATE__;

const projection =
  window.__PROJECTION__;

requestAnimationFrame(tick);

function randomize(obj)
{
  for(const key in obj)
  {
    const value = obj[key];

    if(typeof value === "number")
    {
      obj[key] +=
        (Math.random() - 0.5);
    }

    else if(
      typeof value === "object" &&
      value !== null
    )
    {
      randomize(value);
    }
  }
}

function randomMetric()
{
  return (
    Math.random() * 100
  ).toFixed(2);
}

function updateMetricStrips()
{
  document
    .querySelectorAll(
      ".metric"
    )
    .forEach(metric => {

      if(
        metric.children.length < 2
      )
      {
        return;
      }

      const valueEl =
        metric.children[1];

      const text =
        valueEl.textContent;

      if(
        text.includes("%")
      )
      {
        valueEl.textContent =
          (
            Math.random() * 100
          ).toFixed(1) + "%";
      }

      else if(
        !isNaN(
          parseFloat(text)
        )
      )
      {
        valueEl.textContent =
          (
            Math.random() * 1000
          ).toFixed(0);
      }

      else
      {
        const states = [
          "ONLINE",
          "ACTIVE",
          "NOMINAL",
          "HEALTHY",
          "STABLE"
        ];

        valueEl.textContent =
          states[
            Math.floor(
              Math.random() *
              states.length
            )
          ];
      }
    });
}

function updateTables()
{
  document
    .querySelectorAll(
      ".table-view td"
    )
    .forEach(cell => {

      const text =
        cell.textContent.trim();

      const num =
        parseFloat(text);

      if(
        !isNaN(num)
      )
      {
        cell.textContent =
          (
            num +
            (
              Math.random() - 0.5
            ) * 10
          ).toFixed(2);
      }
    });
}

function randomizeJson(data)
{
  if(
    typeof data !== "object" ||
    data === null
  )
  {
    if(
      typeof data === "number"
    )
    {
      return (
        data +
        (
          Math.random() - 0.5
        )
      );
    }

    return data;
  }

  if(Array.isArray(data))
  {
    return data.map(
      randomizeJson
    );
  }

  const out = {};

  for(
    const [k,v]
    of Object.entries(data)
  )
  {
    out[k] =
      randomizeJson(v);
  }

  return out;
}

function updateTreeViews()
{
  document
    .querySelectorAll(
      ".tree-view"
    )
    .forEach(view => {

      if(
        !view.dataset.original
      )
      {
        view.dataset.original =
          view.textContent
            .trim();
      }

      try
      {
        const data =
          JSON.parse(
            view.dataset.original
          );

        const mutated =
          randomizeJson(
            data
          );

        view.textContent =
          JSON.stringify(
            mutated,
            null,
            2
          );
      }
      catch(err)
      {
        console.log(
          "tree parse failed",
          err
        );
      }
    });
}

function updateMasterTree(
  value,
  path = "root"
)
{
  if(
    typeof value !== "object" ||
    value === null
  )
  {
    const element =
      document.querySelector(
        `[data-path="${path}"]`
      );

    if(element)
    {
      element.textContent =
        value;
    }

    return;
  }

  for(
    const [k,v]
    of Object.entries(value)
  )
  {
    updateMasterTree(
      v,
      `${path}.${k}`
    );
  }
}

function tick()
{
  if(
    state?.time
  )
  {
    state.time.tick++;

    state.time.frame++;

    state.time.elapsed +=
      0.016;
  }

  randomize(state);

  if(
    projection?.projection_type ===
    "master"
  )
  {
    updateMasterTree(
      state
    );
  }
  else
  {
    updateMetricStrips();

    updateTables();

    updateTreeViews();
  }

  requestAnimationFrame(
    tick
  );
}

const vs = `
attribute vec3 position;

uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix;

void main()
{
  gl_PointSize = 6.0;

  gl_Position =
    projectionMatrix *
    viewMatrix *
    modelMatrix *
    vec4(
      position,
      1.0
    );
}
`;

const fs = `
precision mediump float;

void main()
{
  gl_FragColor =
    vec4(
      0.4,
      0.8,
      1.0,
      1.0
    );
}
`;

/* ===================================== */
/* ORBITALOPS THEATRE                    */
/* ===================================== */

const canvas =
  document.getElementById(
    "orbital-canvas"
  );

let gl = null;

let shaderProgram = null;

let pointBuffer = null;

let positionLocation = null;

let projectionLocation = null;
let viewLocation = null;
let modelLocation = null;

let globeBuffer = null;
let globeVertexCount = 0;

let linkBuffer = null;
let linkVertexCount = 0;

let dragging = false;
let lastX = 0;
let lastY = 0;

canvas.addEventListener(
  "mousedown",
  e =>
  {
    dragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
  }
);

canvas.addEventListener(
  "mousemove",
  e =>
  {
    if(!dragging)
    {
      return;
    }

    OrbitalScene.camera.yaw +=
      (
        e.clientX - lastX
      ) * 0.01;

    OrbitalScene.camera.pitch +=
      (
        e.clientY - lastY
      ) * 0.01;

    lastX =
      e.clientX;

    lastY =
      e.clientY;
  }
);

window.addEventListener(
  "mouseup",
  () =>
  {
    dragging = false;
  }
);

function createShader(
  gl,
  type,
  source
)
{
  const shader =
    gl.createShader(type);

  gl.shaderSource(
    shader,
    source
  );

  gl.compileShader(
    shader
  );

  if(
    !gl.getShaderParameter(
      shader,
      gl.COMPILE_STATUS
    )
  )
  {
    console.error(
      gl.getShaderInfoLog(
        shader
      )
    );

    return null;
  }

  return shader;
}

function initializeWebGL()
{
  if(!canvas)
  {
    return;
  }

  gl =
    canvas.getContext(
      "webgl2"
    ) ||
    canvas.getContext(
      "webgl"
    );

  if(!gl)
  {
    console.error(
      "WebGL unavailable"
    );

    return;
  }

  console.log(
    "webgl",
    true
  );
  
gl.enable(
  gl.DEPTH_TEST
);

gl.depthFunc(
  gl.LEQUAL
);

  const vertexShader =
    createShader(
      gl,
      gl.VERTEX_SHADER,
      vs
    );

  const fragmentShader =
    createShader(
      gl,
      gl.FRAGMENT_SHADER,
      fs
    );

  shaderProgram =
    gl.createProgram();

  gl.attachShader(
    shaderProgram,
    vertexShader
  );

  gl.attachShader(
    shaderProgram,
    fragmentShader
  );

  gl.linkProgram(
    shaderProgram
  );

  if(
    !gl.getProgramParameter(
      shaderProgram,
      gl.LINK_STATUS
    )
  )
  {
    console.error(
      gl.getProgramInfoLog(
        shaderProgram
      )
    );

    return;
  }

  gl.useProgram(
    shaderProgram
  );

const satelliteVertices =
  buildSatelliteVertices();

pointBuffer =
  gl.createBuffer();

gl.bindBuffer(
  gl.ARRAY_BUFFER,
  pointBuffer
);

gl.bufferData(
  gl.ARRAY_BUFFER,
  satelliteVertices,
  gl.STATIC_DRAW
);

  positionLocation =
    gl.getAttribLocation(
      shaderProgram,
      "position"
    );
    
projectionLocation =
  gl.getUniformLocation(
    shaderProgram,
    "projectionMatrix"
  );

viewLocation =
  gl.getUniformLocation(
    shaderProgram,
    "viewMatrix"
  );

modelLocation =
  gl.getUniformLocation(
    shaderProgram,
    "modelMatrix"
  );

  gl.enableVertexAttribArray(
    positionLocation
  );

  gl.vertexAttribPointer(
    positionLocation,
    3,
    gl.FLOAT,
    false,
    0,
    0
  );
  
  const globeVertices =
  buildSphereVertices();

globeVertexCount =
  globeVertices.length / 3;

globeBuffer =
  gl.createBuffer();

gl.bindBuffer(
  gl.ARRAY_BUFFER,
  globeBuffer
);

gl.bufferData(
  gl.ARRAY_BUFFER,
  globeVertices,
  gl.STATIC_DRAW
);

const linkVertices =
  buildLinkVertices();

linkVertexCount =
  linkVertices.length / 3;

linkBuffer =
  gl.createBuffer();

gl.bindBuffer(
  gl.ARRAY_BUFFER,
  linkBuffer
);

gl.bufferData(
  gl.ARRAY_BUFFER,
  linkVertices,
  gl.STATIC_DRAW
);

}

/* ===================================== */
/* SCENE GRAPH                           */
/* ===================================== */

const OrbitalScene = {
  camera: null,

  globe: null,

  satellites: [],

  links: [],

  regions: [],

  overlays: [],

  labels: [],

  effects: []
};

/* ===================================== */
/* CAMERA                                */
/* ===================================== */

class Camera
{
  constructor()
  {
    this.radius = 3;

    this.yaw = 0;

    this.pitch = 0;

    this.target = {
      x:0,
      y:0,
      z:0
    };
  }
}

OrbitalScene.camera =
  new Camera();

/* ===================================== */
/* GLOBE                                 */
/* ===================================== */

OrbitalScene.globe =
{
  radius:1,

  rotation:0,

  atmosphere:true
};

/* ===================================== */
/* SATELLITES                            */
/* ===================================== */

class Satellite
{
  constructor(
    id,
    lat,
    lon
  )
  {
    this.id = id;

    this.lat = lat;

    this.lon = lon;

    this.altitude = 550;

    this.active = true;
  }
}

for(
  let i = 0;
  i < 100;
  i++
)
{
  OrbitalScene
    .satellites
    .push(
      new Satellite(
        `SAT-${i}`,
        Math.random() * 180 - 90,
        Math.random() * 360 - 180
      )
    );
}

/* ===================================== */
/* LINKS                                 */
/* ===================================== */

for(
  let i = 0;
  i < 150;
  i++
)
{
  OrbitalScene.links.push({
    source:
      Math.floor(
        Math.random() * 100
      ),

    target:
      Math.floor(
        Math.random() * 100
      ),

    strength:
      Math.random(),

    state:
      "active"
  });
}

/* ===================================== */
/* GEO CONVERSION                        */
/* ===================================== */

function latLonToXYZ(
  lat,
  lon,
  radius
)
{
  const phi =
    (90 - lat) *
    Math.PI / 180;

  const theta =
    (lon + 180) *
    Math.PI / 180;

  return {
    x:
      -(
        radius *
        Math.sin(phi) *
        Math.cos(theta)
      ),

    y:
      radius *
      Math.cos(phi),

    z:
      radius *
      Math.sin(phi) *
      Math.sin(theta)
  };
}

/* ===================================== */
/* CANVAS                                */
/* ===================================== */

function resizeCanvas()
{
  if(!canvas)
  {
    return;
  }

  canvas.width =
    canvas.clientWidth;

  canvas.height =
    canvas.clientHeight;
}

window.addEventListener(
  "resize",
  resizeCanvas
);

resizeCanvas();

/* ===================================== */
/* 2D PROTOTYPE RENDERER                 */
/* ===================================== */

function drawBackground(ctx)
{
  ctx.fillStyle =
    "#050b12";

  ctx.fillRect(
    0,
    0,
    canvas.width,
    canvas.height
  );
}

function drawGlobe(ctx)
{
  const cx =
    canvas.width / 2;

  const cy =
    canvas.height / 2;

  const r =
    Math.min(
      canvas.width,
      canvas.height
    ) * 0.35;

  ctx.strokeStyle =
    "#2b7cff";

  ctx.lineWidth = 2;

  ctx.beginPath();

  ctx.arc(
    cx,
    cy,
    r,
    0,
    Math.PI * 2
  );

  ctx.stroke();
}

function drawSatellites(ctx)
{
  const cx =
    canvas.width / 2;

  const cy =
    canvas.height / 2;

  const r =
    Math.min(
      canvas.width,
      canvas.height
    ) * 0.35;

  ctx.fillStyle =
    "#7ec8ff";

  for(
    const sat of
    OrbitalScene.satellites
  )
  {
    const pos =
      latLonToXYZ(
        sat.lat,
        sat.lon,
        r
      );

    ctx.beginPath();

    ctx.arc(
      cx + pos.x,
      cy + pos.y,
      2,
      0,
      Math.PI * 2
    );

    ctx.fill();
  }
}

function drawLinks(ctx)
{
  const cx =
    canvas.width / 2;

  const cy =
    canvas.height / 2;

  const r =
    Math.min(
      canvas.width,
      canvas.height
    ) * 0.35;

  ctx.strokeStyle =
    "rgba(80,160,255,0.2)";

  for(
    const link of
    OrbitalScene.links
  )
  {
    const a =
      OrbitalScene
        .satellites[
          link.source
        ];

    const b =
      OrbitalScene
        .satellites[
          link.target
        ];

    if(!a || !b)
    {
      continue;
    }

    const pa =
      latLonToXYZ(
        a.lat,
        a.lon,
        r
      );

    const pb =
      latLonToXYZ(
        b.lat,
        b.lon,
        r
      );

    ctx.beginPath();

    ctx.moveTo(
      cx + pa.x,
      cy + pa.y
    );

    ctx.lineTo(
      cx + pb.x,
      cy + pb.y
    );

    ctx.stroke();
  }
}

/* ===================================== */
/* SCENE LOOP                            */
/* ===================================== */

function identityMatrix()
{
  return new Float32Array([
    1,0,0,0,
    0,1,0,0,
    0,0,1,0,
    0,0,0,1
  ]);
}

function rotationYMatrix(
  angle
)
{
  const c =
    Math.cos(angle);

  const s =
    Math.sin(angle);

  return new Float32Array([
     c,0,-s,0,
     0,1, 0,0,
     s,0, c,0,
     0,0, 0,1
  ]);
}

function perspectiveMatrix(
  fov,
  aspect,
  near,
  far
)
{
  const f =
    1 /
    Math.tan(
      fov / 2
    );

  const nf =
    1 /
    (near - far);

  return new Float32Array([
    f/aspect,0,0,0,
    0,f,0,0,
    0,0,
    (far+near)*nf,
    -1,

    0,0,
    (2*far*near)*nf,
    0
  ]);
}


function renderScene()
{
  if(!gl)
  {
    return;
  }

const projectionMatrix =
  perspectiveMatrix(
    Math.PI / 3,
    canvas.width /
    canvas.height,
    0.1,
    100
  );

const cameraMatrix =
  buildViewMatrix(
    OrbitalScene.camera
  );

const modelMatrix =
  rotationYMatrix(
    OrbitalScene.globe.rotation
  );
  
  gl.uniformMatrix4fv(
  projectionLocation,
  false,
  projectionMatrix
);

gl.uniformMatrix4fv(
  viewLocation,
  false,
  cameraMatrix
);

gl.uniformMatrix4fv(
  modelLocation,
  false,
  modelMatrix
);

  gl.viewport(
    0,
    0,
    canvas.width,
    canvas.height
  );

  gl.clearColor(
    0.02,
    0.04,
    0.08,
    1.0
  );

  gl.clear(
    gl.COLOR_BUFFER_BIT |
    gl.DEPTH_BUFFER_BIT
  );

/* globe */

gl.bindBuffer(
  gl.ARRAY_BUFFER,
  globeBuffer
);

gl.vertexAttribPointer(
  positionLocation,
  3,
  gl.FLOAT,
  false,
  0,
  0
);

gl.drawArrays(
  gl.POINTS,
  0,
  globeVertexCount
);

OrbitalScene.globe.rotation +=
  0.01;
  
/* links */

gl.bindBuffer(
  gl.ARRAY_BUFFER,
  linkBuffer
);

gl.vertexAttribPointer(
  positionLocation,
  3,
  gl.FLOAT,
  false,
  0,
  0
);

gl.drawArrays(
  gl.LINES,
  0,
  linkVertexCount
);

/* satellites */

gl.bindBuffer(
  gl.ARRAY_BUFFER,
  pointBuffer
);

gl.vertexAttribPointer(
  positionLocation,
  3,
  gl.FLOAT,
  false,
  0,
  0
);

gl.drawArrays(
  gl.POINTS,
  0,
  OrbitalScene.satellites.length
);

  requestAnimationFrame(
    renderScene
  );
}


if(canvas)
{
  initializeWebGL();

  renderScene();
}

function buildSatelliteVertices()
{
  const vertices = [];

  for(
    const sat of
    OrbitalScene.satellites
  )
  {
    const pos =
      latLonToXYZ(
        sat.lat,
        sat.lon,
        0.8
      );

vertices.push(
  pos.x,
  pos.y,
  pos.z
);
  }

  return new Float32Array(
    vertices
  );
}

function buildSphereVertices()
{
  const vertices = [];

  const latSteps = 32;
  const lonSteps = 32;

  for(
    let lat = 0;
    lat <= latSteps;
    lat++
  )
  {
    const phi =
      lat /
      latSteps *
      Math.PI;

    for(
      let lon = 0;
      lon <= lonSteps;
      lon++
    )
    {
      const theta =
        lon /
        lonSteps *
        Math.PI * 2;

      const x =
        Math.sin(phi) *
        Math.cos(theta);

      const y =
        Math.cos(phi);

      const z =
        Math.sin(phi) *
        Math.sin(theta);

      vertices.push(
        x * 0.8,
        y * 0.8,
        z * 0.8
      );
    }
  }

  return new Float32Array(
    vertices
  );
}

function buildLinkVertices()
{
  const vertices = [];

  for(
    const link of
    OrbitalScene.links
  )
  {
    const a =
      OrbitalScene.satellites[
        link.source
      ];

    const b =
      OrbitalScene.satellites[
        link.target
      ];

    if(!a || !b)
    {
      continue;
    }

    const pa =
      latLonToXYZ(
        a.lat,
        a.lon,
        0.8
      );

    const pb =
      latLonToXYZ(
        b.lat,
        b.lon,
        0.8
      );

vertices.push(
  pa.x,
  pa.y,
  pa.z,

  pb.x,
  pb.y,
  pb.z
);
  }

  return new Float32Array(
    vertices
  );
}

function buildViewMatrix(camera)
{
  const yaw =
    rotationYMatrix(
      camera.yaw
    );

  const pitch =
    rotationXMatrix(
      camera.pitch
    );

  const translate =
    translationMatrix(
      0,
      0,
      -camera.radius
    );

  return multiplyMatrices(
    yaw,
    multiplyMatrices(
      pitch,
      translate
    )
  );
}

function rotationXMatrix(
  angle
)
{
  const c =
    Math.cos(angle);

  const s =
    Math.sin(angle);

  return new Float32Array([
    1,0,0,0,
    0,c,s,0,
    0,-s,c,0,
    0,0,0,1
  ]);
}

function translationMatrix(
  x,
  y,
  z
)
{
  return new Float32Array([
    1,0,0,0,
    0,1,0,0,
    0,0,1,0,
    x,y,z,1
  ]);
}

function multiplyMatrices(
  a,
  b
)
{
  const out =
    new Float32Array(16);

  for(
    let row = 0;
    row < 4;
    row++
  )
  {
    for(
      let col = 0;
      col < 4;
      col++
    )
    {
      let sum = 0;

      for(
        let i = 0;
        i < 4;
        i++
      )
      {
        sum +=
          a[row * 4 + i] *
          b[i * 4 + col];
      }

      out[
        row * 4 + col
      ] = sum;
    }
  }

  return out;
}
