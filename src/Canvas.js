import React, { useLayoutEffect, useRef, useState } from 'react'
import rough from 'roughjs/bundled/rough.esm'



let A,B,C;
const generator = rough.generator();

function createElement(x1,y1,x2,y2){

  const roughElement = generator.line(x1,y1,x2,y2)

  return {x1,y1,x2,y2, roughElement}
}

function createPoint(pointxx, pointyy){
  const roughPoint= generator.circle(pointxx,pointyy, 10,10)
  return {pointxx,pointyy, roughPoint}
}

function intersects(a,b,c,d,p,q,r,s) {
  let det, gamma, lambda;
  det = (c - a) * (s - q) - (r - p) * (d - b);
  if (det === 0) {
    return false;
  } else {
    lambda = ((s - q) * (r - a) + (p - r) * (s - b)) / det;
    gamma = ((b - d) * (r - a) + (c - a) * (s - b)) / det;
    return (0 < lambda && lambda < 1) && (0 < gamma && gamma < 1);
  }
};

function EquationOfTheLine(e) //построение уравнения прямой Ax+By+C
 {
	
	  A=e.y2-e.y1;                                            
    B=e.x1-e.x2;
    C=-e.x1*(e.y2-e.y1)+e.y1*(e.x2-e.x1);
 
 }

function IntersectionX(a1,b1,c1,a2,b2,c2)// поиск точки пересечения по Х
 {
	 var d,dx,pointx;
	 d=a1*b2-b1*a2;
	 dx=-c1*b2+b1*c2;
	 pointx=dx/d;
	 return pointx;
 }

 function IntersectionY(a1,b1,c1,a2,b2,c2) //поиск точки пересечения по Y
 {
	 var d,dy,pointy;
	 d=a1*b2-b1*a2;
	 dy=-a1*c2+c1*a2;
	 pointy=dy/d;
	 return pointy;
 }








export const Canvas = () => {

  const [isDrowing, setIsDrowing]=useState(false)
  const [elements, setElements] = useState([])
  const [cross, setCross]=useState([])
  const [shift,setShift]=useState(null)
  
  useLayoutEffect(()=>{
    const canvas=document.getElementById('canvas')
    const context = canvas.getContext("2d")
    context.clearRect(0,0,canvas.width, canvas.height)
    const boundingRect= canvas.getBoundingClientRect()
    setShift(boundingRect.x)
    const roughCanvas = rough.canvas(canvas)
    
    elements.forEach(({roughElement})=>roughCanvas.draw(roughElement))
    cross.forEach((point)=>point==undefined?console.log('first line'):roughCanvas.draw(point.roughPoint))


  },[elements,cross])
  
  const handleMouseMove=(event)=>{
    if(!isDrowing){
      return;
    }
    
    const {clientX,clientY}=event;
    const index = elements.length-1;

    const {x1,y1}= elements[index];
    const updatedElement = createElement(x1,y1,clientX-shift,clientY);
    
    
    const elementsCopy = [...elements];
    elementsCopy[index]= updatedElement;
    setElements(elementsCopy);
    findPointOfIntersect()
  }

  const onFirstClick = (event)=>{
    setIsDrowing(true)
    const {clientX,clientY}=event;
    const element = createElement(clientX-shift,clientY,clientX-shift,clientY)

    setElements(prevState=>[...prevState, element])
    
  }

  const onLastClick = ()=>{
    setIsDrowing(false)
    const point = findPointOfIntersect()
    setCross(point)
    
  }


  function crearCanvas(){
    const canvas=document.getElementById('canvas')
    const context = canvas.getContext("2d")
    context.clearRect(0,0,canvas.width, canvas.height)
    setElements([])
    setCross([])
  }
  

  function findPointOfIntersect(){
    const canvas=document.getElementById('canvas')
    const context = canvas.getContext("2d")
    const roughCanvas = rough.canvas(canvas)
    let a1,b1,c1,a2,b2,c2;
    let point
    let pointArr=[]
    elements.forEach(e=>{
      for(let i=0; i<elements.length;i++){
        let pointxx, pointyy
        if(e==elements[i]){
          return
        }
        else{
          if(intersects(e.x1,e.y1,e.x2,e.y2,elements[i].x1,elements[i].y1,elements[i].x2,elements[i].y2)){
            EquationOfTheLine(e)
            a1=A;b1=B;c1=C;
            EquationOfTheLine(elements[i]);
		        a2=A;b2=B;c2=C;
            pointxx=IntersectionX(a1,b1,c1,a2,b2,c2);
		        pointyy=IntersectionY(a1,b1,c1,a2,b2,c2);

            point = createPoint(pointxx, pointyy);


            roughCanvas.draw(point.roughPoint)
            pointArr.push(point)

           
          }     
          
        }
                    
      }
      
    })
    return pointArr
  }
  



  return (
    <div>
      <canvas 
      id='canvas' 
      width="800" 
      height="600"
      
      onMouseMove={handleMouseMove}
      onClick={(e)=>{
        if(isDrowing===false){
        onFirstClick(e)
        }
        if(isDrowing===true){
          onLastClick()
          
        }
        
        return
        
      }}
      ></canvas>
      <button
        onClick={crearCanvas}
      >Clear</button>
    </div>
    
  )
}
