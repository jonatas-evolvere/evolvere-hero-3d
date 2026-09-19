import * as THREE from 'three';
import {SVGLoader} from 'three/addons/loaders/SVGLoader.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';

const stage=document.querySelector('#stage');
const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(30,1,.1,100);
camera.position.set(0,0,8.8);

const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.setClearColor(0,0);
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.32;
stage.appendChild(renderer.domElement);

const pmrem=new THREE.PMREMGenerator(renderer);
scene.environment=pmrem.fromScene(new RoomEnvironment(),.015).texture;

const root=new THREE.Group();
root.position.set(.72,.02,0);
scene.add(root);

const amber=new THREE.Color('#ff6b00');
const honey=new THREE.Color('#ff9b25');
const shell=new THREE.MeshPhysicalMaterial({
 color:honey,metalness:0,roughness:.035,transmission:.68,thickness:3.2,ior:1.52,
 transparent:true,opacity:1,clearcoat:1,clearcoatRoughness:.018,
 attenuationColor:new THREE.Color('#d63b00'),attenuationDistance:.22,
 specularIntensity:1,specularColor:new THREE.Color('#fff4df'),side:THREE.DoubleSide
});
const edge=new THREE.MeshPhysicalMaterial({
 color:new THREE.Color('#ff7a00'),metalness:.02,roughness:.045,transmission:.62,
 thickness:1.5,ior:1.5,transparent:true,opacity:.86,clearcoat:1,clearcoatRoughness:.02,
 emissive:new THREE.Color('#ff4f00'),emissiveIntensity:.18,side:THREE.DoubleSide
});
const coreMat=new THREE.MeshBasicMaterial({
 color:amber,transparent:true,opacity:.2,blending:THREE.AdditiveBlending,
 depthWrite:false,side:THREE.DoubleSide
});

new SVGLoader().load('./assets/evolvere-simbolo.svg',data=>{
 const object=new THREE.Group();
 for(const path of data.paths){
  for(const shape of SVGLoader.createShapes(path)){
   // Deep bevel + narrow body creates a rounded, lens-like cross section instead of a flat plaque.
   const outer=new THREE.ExtrudeGeometry(shape,{
    depth:10,steps:1,curveSegments:40,bevelEnabled:true,
    bevelThickness:28,bevelSize:34,bevelOffset:-18,bevelSegments:24
   });
   outer.computeVertexNormals();
   object.add(new THREE.Mesh(outer,shell));

   // Warm inner layer, recessed so the shell remains optically dominant.
   const inner=new THREE.ExtrudeGeometry(shape,{
    depth:5,steps:1,curveSegments:36,bevelEnabled:true,
    bevelThickness:17,bevelSize:22,bevelOffset:-24,bevelSegments:18
   });
   inner.computeVertexNormals();
   const innerMesh=new THREE.Mesh(inner,edge);
   innerMesh.position.z=3.5;
   object.add(innerMesh);

   // Internal luminous membrane.
   const membrane=new THREE.Mesh(new THREE.ShapeGeometry(shape,32),coreMat);
   membrane.position.z=7;
   membrane.scale.set(.972,.972,1);
   object.add(membrane);
  }
 }
 const box=new THREE.Box3().setFromObject(object);
 const size=box.getSize(new THREE.Vector3());
 const center=box.getCenter(new THREE.Vector3());
 const s=3.48/Math.max(size.x,size.y);
 object.scale.set(s,-s,s);
 object.position.set(-center.x*s,center.y*s,-center.z*s);
 root.add(object);
});

const innerLight=new THREE.PointLight(0xff5b00,42,8,1.45);
innerLight.position.set(.25,-.15,-.7); scene.add(innerLight);
const goldKey=new THREE.PointLight(0xffb45f,32,10,1.65);
goldKey.position.set(-2.7,2.5,3.8); scene.add(goldKey);
const whiteStrip=new THREE.PointLight(0xfff5e9,25,9,1.7);
whiteStrip.position.set(2.9,2.0,4.5); scene.add(whiteStrip);
const coolStrip=new THREE.PointLight(0x9dc6ff,9,10,2);
coolStrip.position.set(3.8,-1.8,2.2); scene.add(coolStrip);
const lowWarm=new THREE.PointLight(0xff7a00,17,8,1.8);
lowWarm.position.set(-1.4,-3.2,2.1); scene.add(lowWarm);

let px=0,py=0,tx=0,ty=0;
addEventListener('pointermove',e=>{tx=e.clientX/innerWidth-.5;ty=e.clientY/innerHeight-.5},{passive:true});

function resize(){
 const w=Math.max(stage.clientWidth,1),h=Math.max(stage.clientHeight,1);
 renderer.setSize(w,h,false); camera.aspect=w/h; camera.updateProjectionMatrix();
}
addEventListener('resize',resize); resize();

const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const clock=new THREE.Clock();
function tick(){
 const t=clock.getElapsedTime();
 px+=(tx-px)*.018; py+=(ty-py)*.018;
 if(!reduced){
  root.position.y=.02+Math.sin(t*.34)*.026;
  root.rotation.y=.10+Math.sin(t*.18)*.022+px*.025;
  root.rotation.x=Math.cos(t*.16)*.006+py*.010;
  root.rotation.z=Math.sin(t*.13)*.003;
  goldKey.position.x=-2.7+Math.sin(t*.22)*.45;
  whiteStrip.position.y=2+Math.cos(t*.19)*.38;
  innerLight.intensity=40+Math.sin(t*.31)*3;
 }
 renderer.render(scene,camera);
 requestAnimationFrame(tick);
}
tick();