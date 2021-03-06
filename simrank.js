/**
 * Created by Antonio Altamura on 14/10/2017.
 */
"use strict";
let g = {
	nodes: [],
	edges: []
};
let leftPartition = new Set(),
	rightPartition = new Set();
let G2leftPartition, G2rightPartition;

/**
 Attach 3 methods to sigma graph API for getting the outbounds, inbounds and setting the simRank of a node
 */
sigma.classes.graph.addMethod('O', function (nodeId) {
	return this.edgesArray.reduce((arr, e) => {
		return (e.source === nodeId) ? [...arr, e.target] : arr;
	}, []);
});
sigma.classes.graph.addMethod('I', function (nodeId) {
	return this.edgesArray.reduce((arr, e) => {
		return (e.target === nodeId) ? [...arr, e.source] : arr;
	}, []);
});
sigma.classes.graph.addMethod('setRank', function (nodeId, value) {
	let n = this.nodesIndex.get(nodeId);
	n.rank = value;
	n.label = n.id + " " + (Math.round(n.rank * 1000) / 1000)
});

/**
 Instanciate the sigma object
 */
let s = new sigma({
	graph: g,
	container: 'graph-container',
	settings: {
		labelThreshold: 0
	}
});
let [O, I] = [s.graph.O, s.graph.I];

$.get("data.txt", function (data, status) {
	let edges = [];
	data.split(/\r?\n/).map((row, i) => {
		let e = row.split(',');
		leftPartition.add(e[0])
		rightPartition.add(e[1])
		edges.push({
			id: i,
			source: e[0],
			target: e[1],
			color: '#ccc',
			type: "arrow"
		})
	});

	//converting Set to Array (Set.prototype.forEach doesn't provide the numeric index I need for y coords)
	[...leftPartition].forEach((n, i) => {
		s.graph.addNode({id: n, label: n, y: i, x: 0, text: n,})
	});
	[...rightPartition].forEach((n, i) => {
		s.graph.addNode({id: n, label: n, y: i, x: 2, text: n})
	});
	edges.forEach(e => s.graph.addEdge(e));

	/**
	 Utility function, takes a 'coupledNode', e.g. "(A,B)", returns sigma graph node references to its single nodes
	 */
	let getNodeByPair = function (coupledNode) {
		return {
			l: s.graph.nodes(coupledNode.couple.l),
			r: s.graph.nodes(coupledNode.couple.r)
		}
	};

	/**
	 * Generates G^2 nodes
	 */
	let generateG2partition = function (set, partition) {
		let pairs = [];
		let y = 0;
		let xCoord = (partition === "LEFT") ? 10 : 20;

		set.forEach(i => {
			set.forEach(j => {
				pairs.push({
					id: `${i},${j}`,
					label: `${i},${j}`,
					text: `${i},${j}`,
					x: xCoord,
					y: y++,
					couple: {
						l: `${i}`,
						r: `${j}`
					}
				});
			})
		});
		return pairs;
	};
	/**
	 * adding nodes of G^2
	 */
	G2leftPartition = generateG2partition(leftPartition, "LEFT");
	G2rightPartition = generateG2partition(rightPartition, "RIGHT");
	G2leftPartition.concat(G2rightPartition).forEach(n => s.graph.addNode(n));

	/**
	 *  adding edges of G^2
	 */
	//iterates right Partition of G^2
	G2rightPartition.forEach(n => {
		let couple = getNodeByPair(n);
		let inBoundsL = I(couple.l.id);
		let inBoundsR = I(couple.r.id);
		//iterates left Partition of G^2
		G2leftPartition.forEach((x, i) => {
			//-1 is the only case a bitwise NOT returns 0
			if (!!~inBoundsL.indexOf(x.couple.l) && !!~inBoundsR.indexOf(x.couple.r)) {
				s.graph.addEdge({id: `${x.id},${n.id}`, color: '#ccc', source: x.id, target: n.id})
			}
		});
	});
	s.refresh();
});

/**
 *  The SimRank computation
 * */
let C = 0.8;
let numIter;
let simRank = {
	init: function () {
		numIter = 0;
		$('#numIter').css('display', 'inline-block');
		$('#numIter span').html(numIter);
		s.graph.nodes().forEach(n => n.couple && s.graph.setRank(n.id, +( n.couple.l === n.couple.r)));
		s.refresh();
	},
	iteration: function () {
		let it = $('#inputNumIter').val() || 1;
		let i = 0;
		while (++i <= it) {
			G2leftPartition.forEach(n => {
				simRank.s(n.couple.l, n.couple.r, "LEFT")
			});
			G2rightPartition.forEach(n => {
				simRank.s(n.couple.l, n.couple.r, "RIGHT")
			});
			$('#numIter span').html(++numIter)
		}
		s.refresh();
	},
	s: function (Aid, Bid, partition) {
		let links = (partition === "LEFT") ? O : I; //define if I'm using outbounds or inbounds
		let [linksA, linksB] = [links(Aid), links(Bid)];
		let sum = 0;
		let coeff = (linksA.length === 0 && linksB.length === 0) ? 0 : C / (linksA.length * linksB.length);
		if (Aid === Bid) {
			s.graph.setRank(`${Aid},${Bid}`, 1);
		}
		else {
			links(Aid).forEach(A => {
				links(Bid).forEach(B => {
					sum += s.graph.nodes(`${A},${B}`).rank;
				});
			});
			s.graph.setRank(`${Aid},${Bid}`, coeff * sum);
		}
	}
};

$("p[data-action]").click(function () {
	simRank[$(this).data('action')]()
});