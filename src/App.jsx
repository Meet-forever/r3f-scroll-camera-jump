import {
  Effects,
  Scroll,
  ScrollControls,
  Text,
  useIntersect,
  useScroll,
  OrbitControls,
} from "@react-three/drei";
import { Canvas, useFrame, useThree, extend } from "@react-three/fiber";
import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { MathUtils, Vector3, Clock } from "three";
import { UnrealBloomPass } from "three-stdlib";
import "./App.css";
extend({ UnrealBloomPass });

const Scene = () => {
  return (
    <>
      <color attach={"background"} args={["black"]} />
    </>
  );
};

const Part1 = () => {
  const visible = useRef(false);
  const box1Ref = useIntersect((isVisible) => (visible.current = isVisible));
  const box2Ref = useIntersect((isVisible) => (visible.current = isVisible));
  const box3Ref = useIntersect((isVisible) => (visible.current = isVisible));
  const positions = useMemo(
    () => [
      {
        position: [0, 2, 0],
        ref: box1Ref,
      },
      {
        position: [4, 2, 0],
        ref: box2Ref,
      },
      {
        position: [-4, 2, 0],
        ref: box3Ref,
      },
    ],
    []
  );
  const visited = useContext(PageVisited);
  const lambda = 10;
  const scroll_data = useScroll();
  const sideSpeed = 12;
  const middleSpeed = 20;
  const allow_scroll = useRef(false)
  useFrame((state, delta) => {
    if(visited.current[0]&&visited.current[1]&&visited.current[2]&&!allow_scroll.current) allow_scroll.current = true
    positions[0].ref.current.position.y = MathUtils.damp(
      positions[0].ref.current.position.y,
      visible.current
        ? Math.max(-(middleSpeed * scroll_data.offset - scroll_data.delta), -10)
        : positions[0].ref.current.position.y,
      lambda,
      delta
    );
    positions[0].ref.current.scale.x = MathUtils.damp(
      positions[0].ref.current.scale.x,
      scroll_data.offset + 1,
      4,
      delta
    );
    positions[0].ref.current.scale.y = MathUtils.damp(
      positions[0].ref.current.scale.y,
      scroll_data.offset + 1,
      4,
      delta
    );
    positions[1].ref.current.position.y = MathUtils.damp(
      positions[1].ref.current.position.y,
      visible.current
        ? Math.max(-(sideSpeed * scroll_data.offset - scroll_data.delta), -8)
        : positions[1].ref.current.position.y,
      lambda,
      delta
    );
    positions[2].ref.current.position.y = MathUtils.damp(
      positions[2].ref.current.position.y,
      visible.current
        ? Math.max(-(sideSpeed * scroll_data.offset - scroll_data.delta), -8)
        : positions[2].ref.current.position.y,
      lambda,
      delta
    );
  });
  const { camera } = useThree();
  const fixedBoxes = useMemo(
    () => [
      [0, 0, -1],
      [4, 0, -2],
      [-4, 0, -2],
      [0, -2, -1],
      [4, -2, -2],
      [-4, -2, -2],
      [0, -4, -1],
      [4, -4, -2],
      [-4, -4, -2],
    ],
    []
  );
  
  const [hovered1, setHovered1] = useState(false);
  const [hovered2, setHovered2] = useState(false);
  const [hovered3, setHovered3] = useState(false);
  return (
    <>
      <Text position={[0, 2, 0]}>Main Scene</Text>
      {positions.map((box_obj, idx) => (
        <mesh key={`bbx-${idx}`} ref={box_obj.ref} position={box_obj.position}>
          <boxGeometry />
          <meshBasicMaterial color={0x613daa} />
        </mesh>
      ))}
      <mesh position={[0, -12, -2]}>
        {/* <boxGeometry args={[14, 10, 0.5, 5, 5]} /> */}
        <planeGeometry args={[14, 10, 10, 2]} />
        <meshBasicMaterial wireframe />
      </mesh>
      {fixedBoxes.map((pos, idx) => (
        <mesh key={`sbox-${idx}`} position={pos}>
          <boxGeometry />
          <meshBasicMaterial />
        </mesh>
      ))}
      <Text style={{ color: "white" }} position={[0, -22, 0]}>
        Pick your shape
      </Text>
      <mesh
        onClick={() => {
          camera.position.copy(new Vector3(20, 0, 5));
          scroll_data.el.scrollTo({ top: 0 });
        }}
        onPointerEnter={() => setHovered1(true)}
        onPointerLeave={() => setHovered1(false)}
        position={[0, -24, 0]}
      >
        <boxGeometry />
        <meshBasicMaterial color={[4, 0.1, 1]} toneMapped={!hovered1} />
      </mesh>
      <mesh
        onClick={() => {
          camera.position.copy(new Vector3(60, 0, 5));
          scroll_data.el.scrollTo({ top: 0 });
        }}
        onPointerEnter={() => setHovered2(true)}
        onPointerLeave={() => setHovered2(false)}
        position={[3, -24, 0]}
      >
        <circleGeometry args={[0.7, 0.7]} />
        <meshBasicMaterial color={[0.5, 1, 4]} toneMapped={!hovered2} />
      </mesh>
      <mesh
        onClick={() => {
          camera.position.copy(new Vector3(40, 0, 5));
          scroll_data.el.scrollTo({ top: 0 });
        }}
        onPointerEnter={() => setHovered3(true)}
        onPointerLeave={() => setHovered3(false)}
        position={[-3, -24, 0]}
      >
        <circleGeometry args={[0.6, 64]} />
        <meshBasicMaterial color={[1, 4, 0.5]} toneMapped={!hovered3} />
      </mesh>
      {/* <Text scale={0.2} position={[0,-26,0]} color={['white']}>
        Page1 = {visited[0].toString()}, 
        Page2 = {visited[1].toString()}, 
        Page3 = {visited[2].toString()}
      </Text> */}
    </>
  );
};

const Part2 = () => {
  const scroll_data = useScroll();
  const { camera } = useThree();
  const visited = useContext(PageVisited);
  const visible = useRef(false);
  const ref = useIntersect((isVisible) => {
    if(isVisible){
      visited.current  = [true, visited.current[1], true,visited.current[2]]
    }
    return visible.current = isVisible
  })
  const [hovered, setHovered] = useState(false);
  // useFrame((state, delta)=>{
  //   // state.camera.position.z = MathUtils.damp(state.camera.position.z, visible.current? Math.max(state.camera.position.z - scroll_data.offset, 3): 5, 4, delta)
  //   // state.camera.rotation.x = MathUtils.lerp(state.camera.rotation.x, visible.current? scroll_data.offset: 0, 0.1);
  //   // console.log(camera.position)
  //   // concamera.position
  // })
  useFrame((state, delta) => {
    ref.current.rotation.y += Math.sin(delta);
    ref.current.rotation.x -= Math.sin(delta);
    ref.current.scale.x = MathUtils.damp(ref.current.scale.x, hovered? 1.2: 1, 4, delta)
    ref.current.scale.y = MathUtils.damp(ref.current.scale.y, hovered? 1.2: 1, 4, delta)
    ref.current.scale.z = MathUtils.damp(ref.current.scale.z, hovered? 1.2: 1, 4, delta)
    if(state.camera.position.x === 20 && scroll_data.offset > 0.08) scroll_data.offset = 0.08;
  });
  // const [clock] = useState(new Clock());
  return (
    <>
      <Text style={{ color: "white" }} position={[20, 2, 0]}>
        Cube
      </Text>
      <mesh
        ref={ref}
        onClick={() => {
          camera.position.copy(new Vector3(0, 0, 5));
          scroll_data.el.scrollTo({
            top: scroll_data.el.scrollHeight / 2 + 1000,
          });
        }}
        onPointerEnter={()=> setHovered(true)}
        onPointerLeave={()=> setHovered(false)}
        position={[20, 0, 0]}
      >
        <boxGeometry args={[1.5, 1.5, 1.5]} />
        <meshBasicMaterial color={[4, 0.1, 1]} toneMapped={false} />
      </mesh>
      <Text scale={0.2} style={{ color: "white" }} position={[20, -2, 0]}>
        Click on the cube to go back
      </Text>
    </>
  );
};
const Part3 = () => {
  const scroll_data = useScroll();
  const { camera } = useThree();
  const visited = useContext(PageVisited);
  const visible = useRef(false);
  const ref = useIntersect((isVisible) => {
    if(isVisible){
      visited.current  = [visited.current[0], true,visited.current[2]]
    }
    return visible.current = isVisible
  })
  const [hovered, setHovered] = useState(false);
  useFrame((state, delta) => {
    if(state.camera.position.x === 40 && scroll_data.offset > 0.08) scroll_data.offset = 0.08;
    ref.current.rotation.x += Math.sin(delta);
    ref.current.scale.x = MathUtils.damp(ref.current.scale.x, hovered? 1.2: 1, 4, delta)
    ref.current.scale.y = MathUtils.damp(ref.current.scale.y, hovered? 1.2: 1, 4, delta)
    ref.current.scale.z = MathUtils.damp(ref.current.scale.z, hovered? 1.2: 1, 4, delta)
  });
  return (
    <>
      <Text style={{ color: "white" }} position={[40, 2, 0]}>
        Sphere
      </Text>
      <mesh
        ref={ref}
        onClick={() => {
          camera.position.copy(new Vector3(0, 0, 5));
          scroll_data.el.scrollTo({
            top: Math.round(scroll_data.el.scrollHeight / 2) + 1000,
          });
        }}
        onPointerEnter={()=> setHovered(true)}
        onPointerLeave={()=> setHovered(false)}
        position={[40, 0, 0]}
      >
        <sphereGeometry args={[0.8]} />
        <meshBasicMaterial color={[1, 4, 0.5]} toneMapped={false} />
      </mesh>
      <Text scale={0.2} style={{ color: "white" }} position={[40, -2, 0]}>
        Click on the sphere to go back
      </Text>
    </>
  );
};
const Part4 = () => {
  const scroll_data = useScroll();
  const { camera } = useThree();
  const visited = useContext(PageVisited);
  const visible = useRef(false);
  const [hovered, setHovered] = useState(false);
  const ref = useIntersect((isVisible) => {
    if(isVisible){
      visited.current  = [visited.current[0], visited.current[1], true]
    }
    return visible.current = isVisible
  })
  useFrame((state, delta) => {
    if(state.camera.position.x === 60 && scroll_data.offset > 0.08) scroll_data.offset = 0.08
    ref.current.rotation.y += delta;
    ref.current.scale.x = MathUtils.damp(ref.current.scale.x, hovered? 1.2: 1, 4, delta)
    ref.current.scale.y = MathUtils.damp(ref.current.scale.y, hovered? 1.2: 1, 4, delta)
    ref.current.scale.z = MathUtils.damp(ref.current.scale.z, hovered? 1.2: 1, 4, delta)
  });
  
  
  return (
    <>
      <Text style={{ color: "white" }} position={[60, 2, 0]}>
        Tetrahedron
      </Text>
      <mesh
        ref={ref}
        onClick={() => {
          camera.position.copy(new Vector3(0, 0, 5));
          scroll_data.el.scrollTo({
            top: Math.round(scroll_data.el.scrollHeight / 2) + 1000,
          });
        }}
        onPointerEnter={()=> setHovered(true)}
        onPointerLeave={()=> setHovered(false)}
        position={[60, 0, 0]}
      >
        <coneGeometry args={[1, 1.4, 3]} />
        <meshBasicMaterial color={[0.5, 1, 4]} toneMapped={false} />
      </mesh>
      <Text scale={0.2} style={{ color: "white" }} position={[60, -2, 0]}>
        Click on the tetrahedron to go back
      </Text>
    </>
  );
};

export const PageVisited = createContext();
const vec = new Vector3();
function Rig({grp}) {
  return useFrame(({ mouse }) => {
    vec.set(mouse.x * 1.02, mouse.y * 1.02, grp.current.position.z)
    grp?.current.position.lerp(vec, 0.025);
  })
}
function App() {
  const visited = useRef([false, false, false]);
  const ref = useRef()
  return (
    <PageVisited.Provider value={visited}>
      <Canvas>
        <Scene />
        <Effects disableGamma>
          <unrealBloomPass threshold={1} strength={0.5} radius={1} />
        </Effects>
        <ScrollControls damping={0.3} pages={4}>
          <Scroll>
            <group ref={ref}>
              <Part1 />
              <Part2 />
              <Part3 />
              <Part4 />
            </group>
          </Scroll>
        </ScrollControls>
        <Rig grp={ref} />
      </Canvas>
    </PageVisited.Provider>
  );
}

export default App;