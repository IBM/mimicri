import React, {useRef, useEffect, useState} from "react";
import * as d3 from "d3";

import * as THREE from 'three';

import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';

import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

export const FrameRender = ({image=[],
							overlay,
							scale=3}) => {

	const visibleRef = useRef('visible_ref');
	const hideRef = useRef('hide_ref');

	const controlsRef = useRef('controls_ref');

	const ref = useRef('threejs_static');
	const requestRef = React.useRef(-1);

	const [showImgOverlay, setShowImgOverlay] = useState(true);

	const scene = useRef(new THREE.Scene());
	scene.current.background = new THREE.Color(0xffffff);

	const camera = useRef(new THREE.PerspectiveCamera());

	const renderer = useRef(new THREE.WebGLRenderer());

	const geometry = useRef(new THREE.BufferGeometry());
	const overlayGeometry = useRef(new THREE.BufferGeometry());

	const pointsMaterial = useRef(new THREE.PointsMaterial());
	const newOverlayMaterial = useRef(new THREE.PointsMaterial());

    // let overlayGeometry = new THREE.BufferGeometry();
    // const overlayPoints = useRef({});

    let segmentColorScale = d3.scaleOrdinal(d3.schemeTableau10)
		 					  .domain([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);

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

		ref.current.appendChild(renderer.current.domElement);

		d3.select(hideRef.current).style("display", "flex").style("margin-top", "10px");
		d3.select(visibleRef.current).style("display", "none").style("margin-top", "10px");

		d3.select(controlsRef.current)
		 		.style("display", "flex")

		return () => {renderer.current.dispose();
					  geometry.current.dispose();
					  overlayGeometry.current.dispose();
					  pointsMaterial.current.dispose();
					  newOverlayMaterial.current.dispose()}

	}, [])

	useEffect(() => {

		if (image.length > 0) {

			renderer.current.dispose();

			imageMeta = {"width": image && image[0] ? image[0].length : 0,
		 				 "height": image && image.length ? image.length : 0};

		 	layout = {"width": imageMeta.width * scale,
		 			  "height": imageMeta.height * scale};

		 	d3.select(controlsRef.current).style("width", layout.width + "px");

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

			// let pointsMaterial;

			geometry.current.dispose()
		    geometry.current = new THREE.BufferGeometry();

		    let colors = [];
		    let positions = [];

		    for (const p of flatImage) {
		    	positions.push(p.position[0], p.position[1], 0);
		    	color.set( p.color );
    			colors.push( color.r, color.g, color.b );
		    }

		    geometry.current.setAttribute("position", new THREE.Float32BufferAttribute( positions, 3 ));
		    geometry.current.setAttribute("color", new THREE.Float32BufferAttribute( colors, 3 ) );

		    pointsMaterial.current.dispose();
		    pointsMaterial.current = new THREE.PointsMaterial({
		      // map: spriteMap,
		      size: scale,
		      // transparent: true,
		      // blending: THREE.AdditiveBlending,
		      sizeAttenuation: false,
		      vertexColors: true,
		    });
		    const points = new THREE.Points(geometry.current, pointsMaterial.current);
		    scene.current.add(points);
				
		}

	}, [image])

	useEffect(() => {

		if (!showImgOverlay) {
			scene.current.remove(scene.current.getObjectByName("overlay"));
		}

		if (showImgOverlay && overlay) {

			let flattenOverlay = overlay.flat();
		 	let extentOverlay = d3.extent(flattenOverlay);

		 	let newFlatOverlay = preprocess(overlay, imageMeta, segmentColorScale, true);

		 	scene.current.remove(scene.current.getObjectByName("overlay"));

		 	// let newOverlayMaterial;

		    let newOverlayColors = [];
		    let newOverlayPositions = [];

		    // const overlayColor = new THREE.Color();

		    for (const o of newFlatOverlay) {
		    	newOverlayPositions.push(o.position[0], o.position[1], 0.00001);
		    	color.set( o.color );

    			newOverlayColors.push( color.r, color.g, color.b );
		    }

		    overlayGeometry.current.dispose();
		    overlayGeometry.current = new THREE.BufferGeometry();

		    overlayGeometry.current.setAttribute("position", new THREE.Float32BufferAttribute( newOverlayPositions, 3 ));
		    overlayGeometry.current.setAttribute("color", new THREE.Float32BufferAttribute( newOverlayColors, 3 ) );

		    newOverlayMaterial.current.dispose();
		    newOverlayMaterial.current = new THREE.PointsMaterial({
		      // map: spriteMap,
		      size: scale,
		      // transparent: true,
		      // blending: THREE.AdditiveBlending,
		      sizeAttenuation: false,
		      vertexColors: true,
		    });

		    let overlayPoints = new THREE.Points(overlayGeometry.current, newOverlayMaterial.current);
		    overlayPoints.name = "overlay";
		    scene.current.add(overlayPoints);
		}

		renderer.current.render(scene.current, camera.current);

	}, [overlay, showImgOverlay, segmentColorScale])
	

	function visibleOverlay() {
		d3.select(visibleRef.current).style("display", "none");
		d3.select(hideRef.current).style("display", "flex");
		setShowImgOverlay(true);
	}

	function hideOverlay() {
		d3.select(visibleRef.current).style("display", "flex");
		d3.select(hideRef.current).style("display", "none");
		setShowImgOverlay(false);
	}

	return (
		<div>
			<div id="threejs_static" ref={ref} />
			<div id="controls" ref={controlsRef}>
				<Button ref={visibleRef}
						id="visibleOverlay"
						startIcon={<Visibility />}
						onClick={visibleOverlay}>
					Show Overlay
				</Button>
				<Button
					ref={hideRef}
					id="hiddenOverlay"
					startIcon={<VisibilityOff />}
					onClick={hideOverlay}>
					Hide Overlay
				</Button>
			</div>
		</div>
	)

}