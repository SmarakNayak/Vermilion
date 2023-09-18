import React, { useState, useEffect } from 'react';
import { useParams, Link } from "react-router-dom";
import styled from 'styled-components';
import { lightTheme } from '../styles/themes';

const Edition = () => {
  let { sha256 } = useParams();
  const [binaryContent, setBinaryContent] = useState(null);
  const [blobUrl, setBlobUrl] = useState(null);
  const [textContent, setTextContent] = useState(null);
  const [editions, setEditions] = useState(null);
  const [firstEdition, setFirstEdition] = useState(null);
  const [editionCount, setEditionCount] = useState(null);
  const [contentType, setContentType] = useState(null);
  //Table
  const [pageNo, setPageNo] = useState(1);
	const [noOfPages, setNoOfPages] = useState(1);

  useEffect(() => {

    const fetchContent = async () => {
      setBlobUrl(null);
      setTextContent(null);
      setContentType("loading");
      //1. Get content
      const response = await fetch("/api/inscription_sha256/"+sha256);
      //2. Assign local url
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setBinaryContent(blob);
      setBlobUrl(url);
      //3. Work out type
      let content_type = response.headers.get("content-type");
      switch (content_type) {
        //Image types
        case "image/png":
          setContentType("image");
          break;
        case "image/jpeg":
          setContentType("image");
          break;
        case "image/webp":
          setContentType("image");
          break;
        case "image/svg+xml":
          setContentType("image");
          break;
        case "image/gif":
          setContentType("image");
          break;
        case "image/avif":
          setContentType("image");
          break;
        //Text types
        case "text/plain;charset=utf-8":
          setContentType("text");
          break;
        case "application/json":
          setContentType("text");
          break;
        case "text/plain":
          setContentType("text");
          break;
        case "text/rtf":
          setContentType("text");
          break;
        //Html types
        case "text/html;charset=utf-8":
          setContentType("html");
          break;
        case "text/html":
          setContentType("html");
          break;
        //Video types
        case "video/mp4":
          setContentType("video");
          break;
        case "video/webm":
          setContentType("video");
          break;
        //Audio types
        case "audio/mpeg":
          setContentType("audio");
          break;
        //Pdf types
        case "application/pdf":
          setContentType("pdf");
          break;
        //Model types
        case "model/gltf-binary":
          setContentType("model");
          break;
        default:
          setContentType("unsupported");
          break;
      }
    }

    const fetchEditions = async () => {
      const response = await fetch("/api/inscription_editions_sha256/"+sha256);
      const json = await response.json();
      setEditions(json);
      var max;
      for (let index = 0; index < json.length; index++) {        
        const element = json[index];
        if(element.edition==1){
          setFirstEdition(element.number);
        }
        if (max == null || element.edition > max) {
          max = element.edition;
        }        
      }
      setEditionCount(max);
      setNoOfPages(Math.max(1,Math.ceil(json.length/10)))
    }

    fetchContent();
    fetchEditions();
  },[sha256])

  useEffect(()=> {
    const updateText = async () => {
      //1. Update text state variable if text type
      if(contentType=="text" || contentType==="svg" || contentType==="html") {
        const text = await binaryContent.text();
        setTextContent(text);
      }
    }
    updateText();    
  },[contentType])
  
  const onLeftArrowClick = () => {
		setPageNo(Math.max(1,pageNo-1))
	}
	const onRightArrowClick = () => {
		setPageNo(Math.min(noOfPages,pageNo+1))
	}
  
  return (
    <PageContainer>
      <Heading>Inscription {firstEdition}</Heading>
      {
        {
          'image': <ImageContainer src={blobUrl} />,
          'svg': <SvgContainer dangerouslySetInnerHTML={{__html: textContent}} />,
          'html': <HtmlContainer><StyledIframe src={"/api/inscription_number/" + firstEdition} scrolling='no' sandbox='allow-scripts'></StyledIframe></HtmlContainer>,
          'text': <TextContainer>{textContent}</TextContainer>,
          'video': <video controls loop muted autoplay><source src={blobUrl} type={contentType}/></video>,
          'audio': <audio controls><source src={blobUrl} type={contentType}/></audio>,
          'pdf': <TextContainer>pdf unsupported'</TextContainer>,
          'model': <TextContainer>gltf model type unsupported</TextContainer>,
          'unsupported': <TextContainer>{contentType} content type unsupported</TextContainer>,
          'loading': <TextContainer>loading...</TextContainer>
        }[contentType]
      }      
      <div>
        <p>{editionCount} Edition(s)</p>
        <p>Sha256: {sha256}</p>
        <StyledTable>
          <thead>
            <tr>
              <th style={{fontWeight:"normal"}}>Edition</th>
              <th style={{fontWeight:"normal"}}>Number</th>
            </tr>
          </thead>
          <tbody>
            {editions ?
              editions
              .slice(
                (pageNo-1)*10,
								pageNo*10
              )
              .map((row) => {
                const table = (
                  <>
                    <tr>
                      <td>{row.edition}</td>
                      <td><Link to={'/inscription/' + row.number}>{row.number}</Link></td>
                    </tr>
                  </>
                )
                return table;
              }) :
              <div/>
            }
          </tbody>
        </StyledTable>
        <StyledTablePaginator>
          <StyledArrowContainer onClick = {onLeftArrowClick}>←</StyledArrowContainer> 
          <p>Page {pageNo} of {noOfPages}</p> 
          <StyledArrowContainer onClick = {onRightArrowClick}>→</StyledArrowContainer>
        </StyledTablePaginator>
      </div>
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

const ImageContainer = styled.img`
  min-height:16rem;
  min-height:16rem;
  max-width:32rem;
  max-height:32rem;
  width: auto;
  height: auto;
  image-rendering: pixelated;
`;

const SvgContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height:12rem;
  min-width:24rem;
  max-width:32rem;
  width: auto;
  height: auto;
  image-rendering: pixelated;
`;

const Heading = styled.h2`
  font-family: monospace;
  font-weight: normal;
`

const TextContainer = styled.p`
  max-width: 800px;
  font-size: 1em;
  display: block;
  font-family: monospace;
  white-space-collapse: preserve;
  margin: 10em 10em;
`;

const HtmlContainer = styled.div`
  display: flex;
  justify-content: center;
  min-width: 35rem;
  min-height: 35rem;
`

const StyledIframe = styled.iframe`
  border: none;
  //flex: 0 100%;
  //flex-grow: 1;
  width: 100%;
  resize: both;
  //aspect-ratio: 1/1;
`

const StyledTable = styled.table`
  margin-left: auto;
  margin-right: auto;
	border-spacing: 20px 4px;
	white-space: nowrap;
`

const StyledArrowContainer = styled.p`
	color: rgb(150,150,150);
	cursor: pointer;
	:hover,
  :focus {
    color: rgb(0,0,0);
  }

  &.active {
    color: rgb(0,0,0);
    font-weight:550;
  }
`

const StyledTablePaginator = styled.div`
	display: flex;
	justify-content: center;
	gap: 10px;
	padding-top: 10px;
`

export default Edition;