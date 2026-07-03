const http = require("http");
const fs = require("fs");
const path = require("path");

const masterState = JSON.parse(
  fs.readFileSync(
    "./naive_master_state_complete.json",
    "utf8"
  )
);

const uiSchema = JSON.parse(
fs.readFileSync(
"./master_state_ui_schema_complete.json",
"utf8"
)
);

const projectionRegistry = {};

const projectionDir =
  path.join(
    __dirname,
    "json"
  );

for (
  const file of fs.readdirSync(
    projectionDir
  )
) {
  if (!file.endsWith(".json")) {
    continue;
  }

  const projection =
    JSON.parse(
      fs.readFileSync(
        path.join(
          projectionDir,
          file
        ),
        "utf8"
      )
    );

const route =
  file.replace(
    "_projection.json",
    ""
  );

  projectionRegistry[
    route
  ] = projection;
}


function renderNode(
  value,
  path = "root"
)
{
  if(
    typeof value !== "object" ||
    value === null
  )
  {
    return `
      <div class="leaf">
        <span class="key">${path}</span>
        <span
          class="value"
          data-path="${path}">
          ${value}
        </span>
      </div>
    `;
  }

  let html = `
    <div class="node">
      <h4>${path}</h4>
  `;

  for(
    const [k,v]
    of Object.entries(value)
  )
  {
    html += renderNode(
      v,
      `${path}.${k}`
    );
  }

  html += "</div>";

  return html;
}

const projection = {
  type: "master"
};

const widgetRegistry = {
  panel: renderPanel,
  header: renderHeader,
  text: renderText,
  metric_strip: renderMetricStrip,
  table_view: renderTableView,
  tree_view: renderTreeView,
  canvas_view: renderCanvasView
};

function renderPanel(node)
{
  const children =
    (node.children || [])
      .map(renderWidget)
      .join("");

return `
  <div
    class="panel"
    data-panel-id="${
      node.id || ""
    }"
    data-panel-role="${
      node.role || ""
    }"
  >
    ${children}
  </div>
`;
}

function renderHeader(node)
{
  return `
    <div
      class="header"
      data-widget-id="${
        node.id || ""
      }"
      data-widget-role="${
        node.role || ""
      }"
    >
      <h2>
        ${node.title || ""}
      </h2>
    </div>
  `;
}

function renderText(node)
{
  return `
    <div
      class="text"
      data-widget-id="${
        node.id || ""
      }"
      data-widget-role="${
        node.role || ""
      }"
    >
      ${node.text || ""}
    </div>
  `;
}

function renderMetricStrip(node)
{
  const metrics =
    node.metrics || [];

  return `
    <div
      class="metric-strip"
      data-widget-id="${
        node.id || ""
      }"
      data-widget-role="${
        node.role || ""
      }"
    >
      ${
        metrics.map(
          m => `
            <div class="metric">
              <div>${m.label}</div>
              <div>${m.value}</div>
            </div>
          `
        ).join("")
      }
    </div>
  `;
}

function renderTableView(node)
{
  const rows =
    node.rows || [];

  return `
    <table
      class="table-view"
      data-widget-id="${
        node.id || ""
      }"
      data-widget-role="${
        node.role || ""
      }"
    >
      ${
        rows.map(
          row => `
            <tr>
              ${
                row.map(
                  c => `<td>${c}</td>`
                ).join("")
              }
            </tr>
          `
        ).join("")
      }
    </table>
  `;
}

function renderTreeView(node)
{
  return `
    <pre
      class="tree-view"
      data-widget-id="${
        node.id || ""
      }"
      data-widget-role="${
        node.role || ""
      }"
    >
      ${
        JSON.stringify(
          node.data || {},
          null,
          2
        )
      }
    </pre>
  `;
}

function renderCanvasView(node)
{
  return `
    <div
      class="canvas-view"
      id="${
        node.id ||
        "canvas-view"
      }"
    >
      <canvas
        id="${
          node.canvas_id ||
          "orbital-canvas"
        }"
      ></canvas>
    </div>
  `;
}

function renderWidget(node)
{
  if(!node)
  {
    return "";
  }

  const renderer =
    widgetRegistry[
      node.type
    ];

  if(!renderer)
  {
    return `
      <div class="unknown-widget">
        Unknown Widget:
        ${node.type}
      </div>
    `;
  }

  return renderer(node);
}

function renderProjectionContent(
  projection,
  isRoot = false
)
{
  if(isRoot)
  {
    return renderNode(
      projection
    );
  }

  const tree =
    projection?.widget_tree;

  if(!tree)
  {
    return `
      <pre>
      ${
        JSON.stringify(
          projection,
          null,
          2
        )
      }
      </pre>
    `;
  }

  return renderWidget(
    tree.root
  );
}

function renderProjection(
  state,
  projection
)
{
  const projectedState = state;

  return `
<!DOCTYPE html>
<html>

<head>

<title>Master State</title>

<link
  rel="stylesheet"
  href="/styles.css"
/>

</head>

<body>

<h1>
Projection:
${
  projection?.projection_type ||
  projection?.type ||
  "master"
}
</h1>

<div
  id="projection"
  class="
    projection
    projection-${
      projection?.projection_type ||
      "master"
    }
  "
>
<nav>

<a href="/">master</a>

<a href="/schema">
schema
</a>

<a href="/executive">
executive
</a>

<a href="/system">
system
</a>

<a href="/memory">
memory
</a>

<a href="/graph">
graph
</a>

<a href="/vector">
vector
</a>

<a href="/network">
network
</a>

<a href="/reasoning">
reasoning
</a>

<a href="/render">
render
</a>

<a href="/telemetry">
telemetry
</a>

<a href="/debug">
debug
</a>

<a href="/derived">
derived
</a>

<a href="/theatre">
theatre
</a>

</nav>

<hr>
${renderProjectionContent(
    projectedState,
    projection?.projection_type ===
      "master"
)}
</div>

<script>

window.__MASTER_STATE__ =
${JSON.stringify(projectedState)};

window.__PROJECTION__ =
${JSON.stringify(projection)};

</script>

<script src="/main.js"></script>

</body>

</html>
`;
}

http.createServer(
	(req,res)=>{

if(
  req.url === "/styles.css"
)
{
  res.writeHead(
    200,
    {
      "Content-Type":
        "text/css"
    }
  );

  res.end(
    fs.readFileSync(
      "./styles.css",
      "utf8"
    )
  );

  return;
}

  	if(
    	req.url === "/main.js"
  	)
  	{
    	res.writeHead(
      	200,
      	{
        	"Content-Type":
          	"application/javascript"
      	}
    	);
	
    	res.end(
      	fs.readFileSync(
        	"./main.js"
      	)
    	);
	
    	return;
  	}
	
  	if(
    	req.url ===
    	"/api/projections"
  	)
  	{
    	res.writeHead(
      	200,
      	{
        	"Content-Type":
          	"application/json"
      	}
    	);
	
    	res.end(
      	JSON.stringify(
        	Object.keys(
          	projectionRegistry
        	),
        	null,
        	2
      	)
    	);
	
    	return;
  	}



if (
  req.url === "/schema"
)
{
  res.writeHead(
    200,
    {
      "Content-Type":
        "text/html"
    }
  );

  let panelsHtml = "";

  const panels =
    uiSchema?.ui?.panels ||
    {};

  for(
    const [id,panel]
    of Object.entries(
      panels
    )
  )
  {
    panelsHtml += `
      <div
        style="
          border:1px solid #444;
          padding:12px;
          margin:12px;
        "
      >

        <h3>
          ${
            panel.title ||
            id
          }
        </h3>

        <div>
          id:
          ${id}
        </div>

        <div>
          widgets:
          ${
            panel.widgets
              ?.length || 0
          }
        </div>

        <div>
          actions:
          ${
            panel.actions
              ?.length || 0
          }
        </div>

      </div>
    `;
  }

  res.end(`
<!DOCTYPE html>
<html>

<head>

<title>
Master UI Schema
</title>

<link
  rel="stylesheet"
  href="/styles.css"
/>

</head>

<body>

<h1>
Master UI Schema
</h1>

<nav>

<a href="/">master</a>

<a href="/schema">
schema
</a>

<a href="/executive">
executive
</a>

<a href="/system">
system
</a>

<a href="/memory">
memory
</a>

<a href="/graph">
graph
</a>

<a href="/vector">
vector
</a>

<a href="/network">
network
</a>

<a href="/reasoning">
reasoning
</a>

<a href="/render">
render
</a>

<a href="/telemetry">
telemetry
</a>

<a href="/debug">
debug
</a>

</nav>

<hr>

<div class="panel-grid">
${panelsHtml}
</div>

</body>

</html>
`);

  return;
}

const routeName =
req.url.replace(
/^\//,
""
);

const isRoot =
routeName === "";

const viewState =
isRoot
  ? masterState
  : projectionRegistry[
      routeName
    ];

res.writeHead(
200,
{
"Content-Type":
"text/html"
}
);

res.end(
renderProjection(
viewState ||
masterState,
{
projection_type:
isRoot
  ? "master"
  : routeName
}
)
);
	}
).listen(8080);

console.log(
  "http://localhost:8080"
);
