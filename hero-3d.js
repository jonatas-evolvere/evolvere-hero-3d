import * as THREE from 'three';
import {SVGLoader} from 'three/addons/loaders/SVGLoader.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';

const stage=document.querySelector('#stage');
const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(32,1,.1,100);
camera.position.set(0,0,8.2);

const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.setClearColor(0x000000,0);
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.08;
stage.appendChild(renderer.domElement);

const pmrem=new THREE.PMREMGenerator(renderer);
scene.environment=pmrem.fromScene(new RoomEnvironment(),.03).texture;

const root=new THREE.Group();
root.position.x=.58;
scene.add(root);

const orange=new THREE.Color('#ff6b00');
const glass=new THREE.MeshPhysicalMaterial({
 color:new THREE.Color('#ffb06a'),
 metalness:0,
 roughness:.055,
 transmission:.93,
 thickness:1.15,
 ior:1.47,
 transparent:true,
 opacity:1,
 clearcoat:1,
 clearcoatRoughness:.035,
 attenuationColor:orange,
 attenuationDistance:.72,
 side:THREE.DoubleSide
});
const core=new THREE.MeshBasicMaterial({
 color:orange,
 transparent:true,
 opacity:.22,
 blending:THREE.AdditiveBlending,
 depthWrite:false,
 side:THREE.DoubleSide
});

new SVGLoader().load('./assets/evolvere-simbolo.svg',data=>{
 const object=new THREE.Group();
 for(const path of data.paths){
  for(const shape of SVGLoader.createShapes(path)){
   const outerGeo=new THREE.ExtrudeGeometry(shape,{depth:34,steps:1,curveSegments:24,bevelEnabled:true,bevelThickness:7,bevelSize:5.5,bevelOffset:0,bevelSegments:10});
   object.add(new THREE.Mesh(outerGeo,glass));
   const glowGeo=new THREE.ShapeGeometry(shape,24);
   const glow=new THREE.Mesh(glowGeo,core);
   glow.position.z=17;
   object.add(glow);
  }
 }
 const box=new THREE.Box3().setFromObject(object);
 const size=box.getSize(new THREE.Vector3());
 const center=box.getCenter(new THREE.Vector3());
 const s=3.72/Math.max(size.x,size.y);
 object.scale.set(s,-s,s);
 object.position.set(-center.x*s,center.y*s,-center.z*s);
 root.add(object);
});

const warmBack=new THREE.PointLight(0xff6b00,28,9,1.65);
warmBack.position.set(.2,-.1,-1.6);
scene.add(warmBack);
const warmEdge=new THREE.PointLight(0xff9b54,18,10,1.8);
warmEdge.position.set(-2.4,1.6,3.2);
scene.add(warmEdge);
const coolEdge=new THREE.PointLight(0x9fc5ff,8,10,2);
coolEdge.position.set(3.4,2.6,1.2);
scene.add(coolEdge);
const soft=new THREE.DirectionalLight(0xffffff,1.25);
soft.position.set(-2,4,5);
scene.add(soft);

let px=0,py=0,tx=0,ty=0;
addEventListener('pointermove',e=>{tx=e.clientX/innerWidth-.5;ty=e.clientY/innerHeight-.5},{passive:true});

function resize(){
 const w=Math.max(1,stage.clientWidth),h=Math.max(1,stage.clientHeight);
 renderer.setSize(w,h,false);
 camera.aspect=w/h;
 camera.updateProjectionMatrix();
}
addEventListener('resize',resize);
resize();

const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const clock=new THREE.Clock();
function tick(){
 const t=clock.getElapsedTime();
 px+=(tx-px)*.022; py+=(ty-py)*.022;
 if(!reduced){
  root.position.y=Math.sin(t*.42)*.035;
  root.rotation.y=Math.sin(t*.24)*.018+px*.025;
  root.rotation.x=Math.cos(t*.21)*.009+py*.014;
  root.rotation.z=Math.sin(t*.17)*.004;
  warmBack.intensity=27+Math.sin(t*.35)*2;
 }
 renderer.render(scene,camera);
 requestAnimationFrame(tick);
}
tick();