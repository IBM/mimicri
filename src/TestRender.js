import React, {useRef, useEffect, useState} from "react";
import * as d3 from "d3";

import * as THREE from 'three';

import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';

import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

export const TestRender = ({image=[],
							overlay,
							scale=50,
							segmentColorScale}) => {

	const ref = useRef('threejs_static');
	const requestRef = React.useRef(-1);

	const fps = 20;

	const [showImgOverlay, setShowImgOverlay] = useState(false);
	// let showImgOverlay = false;

	let svgElement;
	// let scene = new THREE.Scene();
	const camera = useRef(new THREE.PerspectiveCamera());

	const renderer = useRef(new THREE.WebGLRenderer());

	let scene = useRef(new THREE.Scene());
	scene.background = new THREE.Color(0xffffff);

	const geometry = useRef(new THREE.BufferGeometry());

	const fpsInterval = 1000 / fps;
    let then = Date.now();
    const startTime = then;

    // let overlayGeometry = new THREE.BufferGeometry();
    // const overlayPoints = useRef({});

    const color = new THREE.Color();

    let imageMeta = {"width": image && image[0] ? image[0].length : 0,
				  	 "height": image && image.length ? image.length : 0};

	let layout = {"width": imageMeta.width * scale,
				  "height": imageMeta.height * scale};


	function preprocess(image, imageMeta, colorScale, isOverlay=false) {
		let minX = -Math.floor(imageMeta.width / 2);
		let minY = -Math.floor(imageMeta.height / 2);

		let result = [];

		for (let x = 0; x < imageMeta.width; x++) {
			for (let y = 0; y < imageMeta.height; y++) {

				if (isOverlay && image[y][x] == 0.0) {
					continue;
				}

				let dataPoint = {"position": [(x + minX) * scale, (y + minY) * scale], "value": image[y][x], "color": colorScale(image[y][x])};
				result.push(dataPoint);
			}
		}

		return result
	}

	useEffect(() => {

		// svgElement = d3.select();
		ref.current.appendChild(renderer.current.domElement);

		d3.select("#visibleOverlay").style("opacity", 0.26);
		d3.select("#hiddenOverlay").style("opacity", 1);

		return () => {renderer.current.dispose(); geometry.current.dispose()}

	}, [])

	useEffect(() => {

		if (image.length > 0) {

			renderer.current.dispose()

			let frame = 0;

			imageMeta = {"width": image && image[0] ? image[0].length : 0,
		 				  	 "height": image && image.length ? image.length : 0};

		 	layout = {"width": imageMeta.width * scale,
		 				  "height": imageMeta.height * scale};

		 	d3.select("#controls")
		 		.style("display", "flex")
				.style("width", layout.width + "px")

			const near_plane = 2;
			const far_plane = 100;

			// Set up camera and scene
			camera.current = new THREE.PerspectiveCamera(
			  2 * Math.atan((layout.height) / (2 * far_plane)) * (180 / Math.PI),
			  layout.width / layout.height,
			  near_plane,
			  far_plane 
			);
			camera.current.position.set(0, 0, far_plane);
			camera.current.lookAt(new THREE.Vector3(0,0,0));
			renderer.current.setSize(layout.width, layout.height);
			
			let flatten = image.flat();
		 	let extent = d3.extent(flatten);
			let colorScale = d3.scaleSequential(d3.interpolateGreys)
		 						.domain([extent[1], extent[0]]);

		 	let flatImage = preprocess(image, imageMeta, colorScale);

			let pointsMaterial;

		    geometry = new THREE.BufferGeometry();

		    let colors = [];
		    let positions = [];

		    for (const p of flatImage) {
		    	positions.push(p.position[0], p.position[1], 0);
		    	color.set( p.color );
    			colors.push( color.r, color.g, color.b );
		    }

		    geometry.setAttribute("position", new THREE.Float32BufferAttribute( positions, 3 ));
		    geometry.setAttribute("color", new THREE.Float32BufferAttribute( colors, 3 ) );

		    pointsMaterial = new THREE.PointsMaterial({
		      // map: spriteMap,
		      size: scale,
		      // transparent: true,
		      // blending: THREE.AdditiveBlending,
		      sizeAttenuation: false,
		      vertexColors: THREE.VertexColors,
		    });
		    const points = new THREE.Points(geometry, pointsMaterial);
		    scene.current.add(points);
				
		}

	}, [image])

	useEffect(() => {

		cancelAnimationFrame(requestRef.current);
		// Three.js render loop
		function animate() {

			requestRef.current = requestAnimationFrame(animate);

			const now = Date.now();
			const elapsed = now - then;

			if (elapsed > fpsInterval) {
				then = now - (elapsed % fpsInterval);

				if (!showImgOverlay) {
					scene.current.remove(scene.current.getObjectByName("overlay"));
				}

				if (showImgOverlay && overlay) {

					let flattenOverlay = overlay.flat();
				 	let extentOverlay = d3.extent(flattenOverlay);
					let newColorScaleOverlay = d3.scaleOrdinal(d3.schemeGnBu[5])
				 								 .domain([extentOverlay[1], extentOverlay[0]]);

				 	let newFlatOverlay = preprocess(overlay, imageMeta, newColorScaleOverlay, true);

				 	scene.current.remove(scene.current.getObjectByName("overlay"));

				 	let newOverlayMaterial;

				    let newOverlayColors = [];
				    let newOverlayPositions = [];

				    // const overlayColor = new THREE.Color();

				    for (const o of newFlatOverlay) {
				    	newOverlayPositions.push(o.position[0], o.position[1], 0.00001);
				    	color.set( o.color );

		    			newOverlayColors.push( color.r, color.g, color.b );
				    }

				    let overlayGeometry = new THREE.BufferGeometry();

				    overlayGeometry.setAttribute("position", new THREE.Float32BufferAttribute( newOverlayPositions, 3 ));
				    overlayGeometry.setAttribute("color", new THREE.Float32BufferAttribute( newOverlayColors, 3 ) );

				    newOverlayMaterial = new THREE.PointsMaterial({
				      // map: spriteMap,
				      size: scale,
				      // transparent: true,
				      // blending: THREE.AdditiveBlending,
				      sizeAttenuation: false,
				      vertexColors: THREE.VertexColors,
				    });

				    let overlayPoints = new THREE.Points(overlayGeometry, newOverlayMaterial);
				    overlayPoints.name = "overlay";
				    scene.current.add(overlayPoints);
				}

				renderer.current.render(scene.current, camera.current);
				
			}
			
		}

		animate();
	}, [overlay, showImgOverlay])
	

	function visibleOverlay() {
		d3.select("#visibleOverlay").style("opacity", 1);
		d3.select("#hiddenOverlay").style("opacity", 0.26);
		setShowImgOverlay(true);
		// showImgOverlay = true;
	}

	function hideOverlay() {
		d3.select("#visibleOverlay").style("opacity", 0.26);
		d3.select("#hiddenOverlay").style("opacity", 1);
		setShowImgOverlay(false);
		// showImgOverlay = false;
	}

	let overlayStyle = {"marginLeft":"auto"};

	return (
		<div>
			<div id="threejs_static" ref={ref}>
			</div>
			<div id="controls">
				<Button disabled style={overlayStyle}>Overlay</Button>
				<IconButton id="visibleOverlay" variant="outlined" onClick={visibleOverlay}>
					<Visibility />
				</IconButton>
				<IconButton id="hiddenOverlay" onClick={hideOverlay}>
					<VisibilityOff />
				</IconButton>
			</div>
		</div>
	)

}