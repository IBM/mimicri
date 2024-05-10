import React, {useState, useEffect, useRef} from "react";
import * as d3 from "d3";
import * as THREE from 'three';

import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';

import PlayArrow from '@mui/icons-material/PlayArrow';
import Pause from '@mui/icons-material/Pause';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

// images and overlays should be in format of [[timeframe1: patient1, patient2, patient3, ...], [timeframe2], [timeframe3], ...]
export const VideoMulti = ({images=[],
							overlays=[],
							scale=4}) => {

	const visibleRef = useRef('visible_ref');
	const hideRef = useRef('hide_ref');

	const playRef = useRef('play_ref');
	const stopRef = useRef('stop_ref');

	const controlsRef = useRef('controls_ref');

	const ref = useRef('threejs_videomulti');
	const requestRef = React.useRef(-1);

	const frame = useRef(0);

	const fps = 20;

	const cols = 7;
	const padding = 2.5;

	const [showImgOverlay, setShowImgOverlay] = useState(true);
	const [play, setPlay] = useState(true);

	const scene = useRef(new THREE.Scene());
	scene.current.background = new THREE.Color(0xffffff);

	const camera = useRef(new THREE.PerspectiveCamera());

	const renderer = useRef(new THREE.WebGLRenderer());

	const geometry = useRef(new THREE.BufferGeometry());
	const overlayGeometry = useRef(new THREE.BufferGeometry());

	const pointsMaterial = useRef(new THREE.PointsMaterial());
	const newOverlayMaterial = useRef(new THREE.PointsMaterial());

	const fpsInterval = 1000 / fps;
    let then = Date.now();
    const startTime = then;

    const color = new THREE.Color();

	let segmentColorScale = d3.scaleOrdinal(d3.schemeTableau10)
		 					  .domain([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);

	function preprocess(image, imageMeta, layout, colorScale, imageCol, imageRow, isOverlay=false) {
		let minX = -Math.floor(layout.width / 2);
		let minY = -Math.floor(layout.height / 2);

		let result = [];

		for (let x = 0; x < imageMeta.width; x++) {
			for (let y = 0; y < imageMeta.height; y++) {

				if (isOverlay && image[y][x] == 0.0) {
					continue;
				}

				let position = [minX + (x + imageCol * (imageMeta.width + padding)) * scale, minY + layout.height - (imageRow * (imageMeta.height + padding)) * scale - imageMeta.height * scale + y * scale];
				let value = image[y][x];
				let color = colorScale(image[y][x]);
				let dataPoint = {"position": position, "value": value, "color": color};
				result.push(dataPoint);
			}
		}

		return result
	}

	useEffect(() => {

		// svgElement = d3.select(ref.current);
		ref.current.appendChild(renderer.current.domElement);

		d3.select(hideRef.current).style("display", "flex").style("margin-top", "10px").style("margin-left", "auto");
		d3.select(visibleRef.current).style("display", "none").style("margin-top", "10px").style("margin-left", "auto");

		d3.select(stopRef.current)
			.style("display", "flex")
			.style("height", "40px");
		d3.select(playRef.current)
			.style("display", "none")
			.style("height", "40px");

		d3.select(controlsRef.current)
		 		.style("display", "flex")
		 		.style("align-items", "center");

		return () => {renderer.current.dispose();
					  geometry.current.dispose();
					  overlayGeometry.current.dispose();
					  pointsMaterial.current.dispose();
					  newOverlayMaterial.current.dispose()}

	}, [])

	useEffect(() => {

		let frameCount = images.length;

		if (frameCount > 0) {

			renderer.current.dispose();
			scene.current.remove(scene.current.getObjectByName("points"));
			geometry.current.dispose();

			cancelAnimationFrame(requestRef.current);

			let firstImage = images[0][0];

			let imageWidth = firstImage[0].length;
			let imageHeight = firstImage.length;

			let rows = Math.ceil(images.length / cols);

			let imageMeta = {"width": imageWidth,
		 				  	 "height": imageHeight};

			let layout = {"width": imageMeta.width * scale * cols + (cols - 1) * padding * scale,
		 				  "height": imageMeta.height * scale * rows + (rows - 1) * padding * scale};

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

			// Three.js render loop
			function animate() {

				requestRef.current = requestAnimationFrame(animate);

				const now = Date.now();
				const elapsed = now - then;

				if (elapsed > fpsInterval) {
					then = now - (elapsed % fpsInterval);

					if (play) {

						frame.current = frame.current + 1;

						if (frame.current >= frameCount) {
							frame.current = frame.current - frameCount;
						}

					} else {

						cancelAnimationFrame(requestRef.current);

						if (!showImgOverlay) {
							scene.current.remove(scene.current.getObjectByName("overlay"));
						}

						let overlay;

						if (overlays.length > 0) {
							overlay = overlays[frame.current];
						}

						if (showImgOverlay && overlay) {

						 	let newOverlayColors = [];
						    let newOverlayPositions = [];

						    scene.current.remove(scene.current.getObjectByName("overlay"));

						 	for (let i = 0; i < overlay.length; i++) {
								let image = overlay[i];

								let imageRow = Math.floor(i / cols);
								let imageCol = i - imageRow * cols;

								let flatten = image.flat();
							 	let extent = d3.extent(flatten);

							 	let flatImage = preprocess(image, imageMeta, layout, segmentColorScale, imageCol, imageRow, true);

							 	// const color = new THREE.Color();

							    for (const p of flatImage) {
							    	newOverlayPositions.push(p.position[0], p.position[1], 0.00001);
							    	color.set( p.color );
					    			newOverlayColors.push( color.r, color.g, color.b );
							    }

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

						return;
					}

					let frameImages = images[frame.current];

					let overlay;

					if (overlays.length > 0) {
						overlay = overlays[frame.current];
					}

					let colors = [];
				    let positions = [];

				    geometry.current = new THREE.BufferGeometry();

					for (let i = 0; i < frameImages.length; i++) {
						let image = frameImages[i];

						let imageRow = Math.floor(i / cols);
						let imageCol = i - imageRow * cols;

						let flatten = image.flat();
					 	let extent = d3.extent(flatten);
						let colorScale = d3.scaleSequential(d3.interpolateGreys)
					 						.domain([extent[1], extent[0]]);

					 	let flatImage = preprocess(image, imageMeta, layout, colorScale, imageCol, imageRow);

					 	// const color = new THREE.Color();

					    for (const p of flatImage) {
					    	positions.push(p.position[0], p.position[1], 0);
					    	color.set( p.color );
			    			colors.push( color.r, color.g, color.b );
					    }

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
				    points.name = "points";
				    scene.current.add(points);

				    if (!showImgOverlay) {
						scene.current.remove(scene.current.getObjectByName("overlay"));
					}

					if (showImgOverlay && overlay) {

					 	let newOverlayColors = [];
					    let newOverlayPositions = [];

					    scene.current.remove(scene.current.getObjectByName("overlay"));

					 	for (let i = 0; i < overlay.length; i++) {
							let image = overlay[i];

							let imageRow = Math.floor(i / cols);
							let imageCol = i - imageRow * cols;

							let flatten = image.flat();
						 	let extent = d3.extent(flatten);

						 	let flatImage = preprocess(image, imageMeta, layout, segmentColorScale, imageCol, imageRow, true);

						 	// const color = new THREE.Color();

						    for (const p of flatImage) {
						    	newOverlayPositions.push(p.position[0], p.position[1], 0.00001);
						    	color.set( p.color );
				    			newOverlayColors.push( color.r, color.g, color.b );
						    }

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

				}

			}

			animate();
		    
		}
		
	}, [images, overlays, showImgOverlay, play])

	function stopVideo() {
		d3.select(playRef.current).style("display", "block");
		d3.select(stopRef.current).style("display", "none");
		setPlay(false);
	}

	function playVideo() {
		d3.select(stopRef.current).style("display", "block");
		d3.select(playRef.current).style("display", "none");
		setPlay(true);
	}

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

	let containerStyle = {"marginLeft": "10px"};

	let multiStyle = {"height": "500px", "overflow":"scroll", "marginTop":`${padding}px`};

	return (
		<div style={containerStyle}>
			<div id="controls" ref={controlsRef}>
				<IconButton ref={stopRef} id="stopVideo" variant="outlined" onClick={stopVideo}>
					<Pause />
				</IconButton>
				<IconButton ref={playRef} id="playVideo" onClick={playVideo}>
					<PlayArrow />
				</IconButton>
				<Button ref={visibleRef}
						id="visibleOverlay"
						startIcon={<Visibility />}
						onClick={visibleOverlay}>
					Show Overlay
				</Button>
				<Button ref={hideRef}
						id="hiddenOverlay"
						startIcon={<VisibilityOff />}
						onClick={hideOverlay}>
					Hide Overlay
				</Button>
			</div>
			<div style={multiStyle} id="threejs_multi" ref={ref}>
			</div>
		</div>
	)

}