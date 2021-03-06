import {createGlobalStyle} from 'styled-components'
import styled from 'styled-components'
import {Cancel} from '@styled-icons/material-outlined/Cancel'

export default createGlobalStyle`

    *:focus {
	outline: none !important;
    }

    *{
        margin:0;
        padding:0;
        user-select: none;
        outline: none !important;
    }

    html,body {
        font-family: 'Titillium Web', sans-serif;
        margin: 0 !important;
        padding:0;
        min-height: 100vh;
        min-width: 100vw;
        justify-content: center;
        width: 100%;
        height: 100vh;
        background: linear-gradient(#1ba5c5, #61d5ec);
        background-size: cover;
        background-position: center;
    }

    .zoom {
        fill: none;
        pointer-events: all;
    }


.comboFieldsControl{
    font-size:14px;
    background:white;
    border-radius:5px;
    box-shadow:inset 1px 1px 3px black;
}



.FakeContent {
  height: 64px;
  display: flex;
  justify-content: center;
  flex-direction: column;
  padding: 11px 16px 11px 16px;
  flex: 1;
}



.customDatePicker{
    padding: 5px 10px;
    font-size: 15px;
    color: #444;
    background: white;
    border-radius: 5px;
    width: 80%;
    height: 35px;
    border: none;
    display: block;
    margin: 10px auto;
    text-align: center;
    box-shadow: inset 2px 2px 5px grey;

	&:hover {
		background-color: rgb(220, 230, 240);
	}

	&:focus {
		outline: none;
		/* box-shadow: 0px 0px 3px 0px rgb(111, 168, 201); */
	}
}


.sidebar {
	height: 100vh;
	padding-left: 20px;
	background-color: white;
	opacity: 1;
    text-shadow: 1px 1px 1px black;
	width: 200px;
	position: fixed;
    box-shadow: 5px 8px 12px black;
    padding-top: 20px;
    top:50px;
    z-index:1000;
}

.sbOpen{
	z-index: 100;
	left: -100%;
	animation: slide-open .75s forwards;
}
@keyframes slide-open {
	100% {
		left: 0;
	}
}

.sbClose {
    left:0;
	animation: slide-closed .75s forwards;
}
@keyframes slide-closed {
	100% {
		left: -100%;
	}
}
`

export const IconRemove = styled(Cancel)`
    position: absolute;
    color: #666;
    width: 25px;
    right: 5px;
    top: 5px;
`
