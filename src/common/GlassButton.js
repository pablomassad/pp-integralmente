import React from 'react'
import styled from 'styled-components'

export default (function GlassButton({
    children, 
    onClick, 
    absolute, 
    top, 
    right, 
    bottom, 
    left, 
    radius, 
    height, 
    width, 
    foreground, 
    background, 
    margin,
    noShadow,
    disabled})
{
    return (
        <Container>
            <FabBtn
                onClick={onClick}
                absolute={absolute}
                top={top}
                right={right}
                bottom={bottom}
                left={left}
                disabled={disabled}
                radius={radius}
                height={height}
                width={width}
                color={foreground}
                margin={margin}
                background={background}
                noShadow={noShadow}>
                <FabChildren>
                    {children}
                </FabChildren>
            </FabBtn>
            {disabled && <DisabledPanel />}
        </Container>
    )
})


const Container = styled.div`
    position: relative;
    text-align:center;
`

const FabBtn = styled.button`
    position: ${props => (props.absolute) ? 'absolute' : 'relative'};
    top: ${props => (props.top) ? props.top+'px' : 'unset'};
    right: ${props => (props.right) ? props.right+'px' : 'unset'};
    bottom: ${props => (props.bottom) ? props.bottom+'px' : 'unset'};
    left: ${props => (props.left) ? props.left+'px' : 'unset'};
    opacity: ${props => (props.disabled) ? .7 : 1};
    color:${props => (props.color) ? props.color : '#fff'};
    width:${props => (props.width) ? props.width + 'px' : '88%'};
    height:${props => (props.height) ? props.height + 'px' : '30px'};
	border-radius: ${props => (props.radius) ? props.radius+'%' : '10px'};
    margin: ${props => (props.margin) ? props.margin+'px' : '10px'};
	box-shadow: ${props => (props.noShadow) ? 'none': '1px 1px 5px black'};
    /* background-image: linear-gradient(#006280, #00c0ed); */
    background:${props => (props.disabled) ? 'grey' : ((props.background) ? props.background : '#1ba0e0')};
    /* , 0 0 50px #aaa; */

    &:after{
        content: '';
        border-radius: ${props => (props.radius) ? props.radius+'%' : '10px'};
        position: absolute;
        top: 2px;
        left: 4px;
        width: calc(100% - 8px);
        height: 50%;
        background: linear-gradient(rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.2));
    }
    &:active {
        background: #4e8fa3;
        transform: translateY(2px);
        text-shadow: 0px -1px 1px black;
        box-shadow: inset 2px 2px 4px black;
    }

    &:active::after {
    	background: linear-gradient(
		rgba(255, 255, 255, 0.3),
		rgba(255, 255, 255, 0.1)
	);

    &:focus {
        outline: none !important;
    }
}
`

const FabChildren = styled.div`
    font-size:13px; 

    @media screen and (min-width: 800px) {
        font-size:1.13rem;
    } 
    /* position: absolute;
	color: white;
	left: 50%;
	top: 50%;
	transform: translate(-50%, -50%); */
`

const DisabledPanel = styled.div`
	position: absolute;;
	z-index: 10;
	height: 100%;
	width: 100%;
	top: 0%;
`


