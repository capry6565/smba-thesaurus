import { Network } from "vis-network";

window.renderRdfGraph = function (triples) {
  const container = document.getElementById("graph");
  if (!container) return;

  const nodes = [];
  const edges = [];

  triples.forEach(t => {
    nodes.push({ id: t.subject, label: t.subject });
    nodes.push({ id: t.object, label: t.object });
    edges.push({ from: t.subject, to: t.object, label: t.predicate });
  });

  const uniqueNodes = [...new Map(nodes.map(n => [n.id, n])).values()];

  const data = { nodes: uniqueNodes, edges };
  const options = {
    physics: {
      enabled: true,
      barnesHut: {
        gravitationalConstant: -30000,
        centralGravity: 0.3,
        springLength: 250, // увеличиваем длину связей
        springConstant: 0.02,
        damping: 0.09
      }
    },
    edges: {
      arrows: "to",
      smooth: false,
      color: { color: "#999" },
      font: { align: "top", size: 10 }
    },
    nodes: {
      shape: "dot",
      size: 14,
      color: { background: "#66b2ff", border: "#0066cc" },
      font: { color: "#000", size: 12, face: "Inter" }
    },
    layout: {
      improvedLayout: true,
      randomSeed: 2
    },
    interaction: {
      dragNodes: true,
      zoomView: true,
      dragView: true
    }
  };

  const network = new Network(container, data, options);
  network.fit(); // автоцентрирование
};
