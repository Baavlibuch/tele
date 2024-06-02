import React from 'react';
// import axios from 'axios';
// import { ENDPOINT } from '../config';
// import LazyLoad from 'react-lazy-load';
//
// import Level from './level';
import Chat from './chatbot';
const { register } = require("../serviceWorker");

// let deferredPrompt;
window.addEventListener('beforeinstallprompt', (event) => {
	event.preventDefault();
	window.deferredPrompt = event;
	return false
});

async function install(event){
	console.log("install clicked")
	if (window.deferredPrompt !== null) {
		window.deferredPrompt.prompt();
		console.log('deferredPrompt await begins')
		const { outcome } = await window.deferredPrompt.userChoice;
		if (outcome === 'accepted') {
			console.log('deferred prompt accepted')
			window.deferredPrompt = null;
		}
		else console.log('deferred prompt outcome = ', outcome)
	}
	else console.error('deferred prompt is null')
}

function Home() {

	console.log("home.js.  HOME()")
	register(null);
	
	return (
		<div className="Home">
			<div className="home-left">
				<div className="header fadeInUp" style={{ animationDelay: '0.5s' }}>
					<div className="header-mid">
						<div className="titles">
							<h1>Virtual Hospital</h1>
							<h2>टेली-कंसल्टेंसी पोर्टल</h2>
						</div>
					</div>
				</div>

				<Chat />
			</div>

			<div className="home-right" style={{alignItems: "center"}}>
				<div onClick={install} className="buttonAction">Install</div>
        {/*<div className="helpline fadeInUp" style={{ animationDelay: '0.5s' }}>*/}
          <div className="row">
            <div className="col">
              {/*<h2>COVID-19 हेल्पलाइन नंबर: </h2>*/}
              {/*<a href="tel:1075">1075</a>*/}
              {/*<a href="tel:+91-11-23978046">+91-11-23978046</a>*/}
            </div>
            <div className="col">
              {/*<h2 style={{ textAlign: 'right' }}>COVID-19 हेल्पलाइन ईमेल आई.डी.</h2>*/}
              {/*<a href="mail:ncov2019@gov.in">ncov2019@gov.in</a>*/}
              {/*<a href="mail:ncov2019@gmail.com">ncov2019@gmail.com</a>*/}
              {/*<h2 style={{ textAlign: 'right' }}>टेली-कंसल्टेंसी पोर्टल हेल्पलाइन ईमेल आई.डी.</h2>*/}
              {/*<a href="mail:telemedicineiitj@gmail.com">telemedicineiitj@gmail.com</a>*/}
            </div>
          </div>
        {/*</div>*/}
			</div>
		</div>
	);
}

export default Home;
