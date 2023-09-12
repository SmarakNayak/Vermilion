import React, { useState, useEffect } from 'react';
import { useParams, Link } from "react-router-dom";
import styled from 'styled-components';
import InscriptionContainer from '../components/InscriptionContainer';
import potpack from 'potpack';

const Block = () => {
  let { number } = useParams();
  const [refs, setRefs] = useState([]); 
  const [nextNumber, setNextNumber] = useState(null);
  const [previousNumber, setPreviousNumber] = useState(null);
  const [images, setImages] = useState([]);
  const [imagesLoaded, setImagesLoaded] = useState(0);
  const [allImagesLoaded, setAllImagesLoaded] = useState(false);

  const [boxes, setBoxes] = useState([]);
  const [canvasHeight, setCanvasHeight] = useState(null);
  const [canvasWidth, setCanvasWidth] = useState(null);

  //1. Get links
  useEffect(() => {
    const fetchContent = async () => {
      //1. Get inscription numbers
      const response = await fetch("/api/inscriptions_in_block/" + number);
      let json = await response.json();
      setRefs(json);
    }
    fetchContent();
    setNextNumber(parseInt(number)+1);
    setPreviousNumber(parseInt(number)-1);
  },[number])

  // //2. Load images, get sizes
  // useEffect(() => {
  //   setImages([]);
  //   for (let index = 0; index < refs.length; index++) {
  //     const element = refs[index];
  //     let img = document.createElement('img');
  //     img.src = "/api/inscription_number/"+element.number
  //     img.onload = () => {
  //       setImages((images) => // Replace the state
  //         [ // with a new array
  //           ...images, // that contains all the old items
  //           { number: element.number, fee: element.genesis_fee, height: img.naturalWidth, width: img.naturalHeight, image: img, src: img.src } // and one new item at the end
  //         ]
  //       );
  //       setImagesLoaded((imagesLoaded) => imagesLoaded+1);
  //     }
  //   }
  // },[refs])

  // //3. Check if all images have loaded and then sort
  // useEffect(()=> {
  //   if (refs.length===imagesLoaded && refs.length>0 && images!==undefined){
  //     //Sort
  //     setImages((images) =>
  //       images.sort((a,b)=>b.fee-a.fee)
  //     );
  //     //Weights & scaled dimensions
  //     let total_fees = images.reduce((partialSum, a) => partialSum + a.fee, 0);
  //     images.forEach((element, index) => {
  //       let weight = element.fee/total_fees;
  //       let orginal_area = element.height*element.width;
  //       let scaled_area = 1000000*weight;
  //       let scale = scaled_area/orginal_area;
  //       let scaled_height = Math.floor(element.height*Math.sqrt(scale));
  //       let scaled_width = Math.floor(element.width*Math.sqrt(scale));
  //       images[index].weight = weight;
  //       images[index].orginal_area = orginal_area;
  //       images[index].scaled_area = scaled_area;
  //       images[index].scale = scale;
  //       images[index].scaled_height = scaled_height;
  //       images[index].scaled_width = scaled_width;
  //     });
  //     console.log("setting all, length:", refs.length );
  //     setAllImagesLoaded(true);
  //   }
  // },[imagesLoaded])

  // //4. Get positions
  // useEffect(() => {
  //   if(allImagesLoaded & images!==null & images!==undefined){
  //     //Positions
  //     let boxes = [];
  //     for (let index = 0; index < images.length; index++) {
  //       let element = images[index];
  //       let box = {
  //         h: element.scaled_height,
  //         w: element.scaled_width,
  //         src: element.src
  //       }
  //       boxes.push(box);
  //     }
  //     const {w, h, fill} = potpack(boxes);
  //     console.log("boxes ", boxes);
  //     setBoxes(boxes);
  //     setCanvasHeight(h);
  //     setCanvasWidth(w);
  //   }
  // },[allImagesLoaded, images])

  return (
    <PageContainer>
      <Heading>Block {number}</Heading>

      {boxes.length>1000
        ? <BlockCanvas id="myCanvas" style={{minHeight: canvasHeight, minWidth: canvasWidth}}>
            {boxes?.map(box => <BlockImg src={box.src} x={box.x} y={box.y} height={box.h} width={box.w} style={{top: box.y, left: box.x}}></BlockImg>)}
          </BlockCanvas>
        : <div/>
      }
      {true 
        ? <Masonry>
            {refs?.map(entry => <Brick><UnstyledLink to={'/inscription/' +entry.number}><InscriptionContainer number={entry.number}></InscriptionContainer></UnstyledLink></Brick>)}
          </Masonry>
        : <div/>}
      <LinksContainer>
        <Link to={'/block/' + previousNumber}> previous </Link>
        <Link to={'/block/' + nextNumber}> next </Link>
      </LinksContainer>
    </PageContainer>
    
  )
}
  
const PageContainer = styled.div`
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  flex: 1;
  align-items: center;
  justify-content: center;
  position: relative;

  @media (max-width: 768px) {
    padding: 0 2rem;
  }
`;

const UnstyledLink = styled(Link)`
  color: unset;
  text-decoration: unset;
`

const LinksContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex: 1;
  align-items: center;
  justify-content: space-between;
  position: relative;
  width: 30%;
  margin-top: 25px;
  margin-bottom: 25px;
`;

const Heading = styled.h2`
  font-family: monospace;
  font-weight: normal;
  margin-top: 50px;
  margin-bottom: 50px;
`

const BlockCanvas = styled.div`
  position: relative;
  border: 1px;
`

const BlockImg = styled.img`
  position: absolute;
`

const Masonry = styled.div`
  column-rule: 1px solid #eee;
  column-gap: 50px;
  column-count: 3;
  column-fill: initial;
  transition: all .5s ease-in-out;
`

const Brick = styled.div`
  padding-bottom: 25px;
  margin-bottom: 25px;
  border-bottom: 1px solid #eee;
  //display: inline-block;
  vertical-align: top;
  display: flex;
  justify-content: center;
`

export default Block;