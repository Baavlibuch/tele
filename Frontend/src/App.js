import React, { useState, useEffect, useContext } from 'react';
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';
// import * as Icon from 'react-feather';
// import $ from 'jquery';

import './App.scss';
import Home from './components/home';
import Navbar from './components/navbar';
import Acknowledgement from './components/acknowledgement';
// import Summary from './components/summary';
// import Cluster from './components/cluster';
import FAQ from './components/faq/faq';
import Doctor from './components/doctor';
import Admin from './components/admin';
// import Banner from './components/banner';
import axios from 'axios';
import { ENDPOINT } from './config';
import Persona from './components/doctor/persona';
import { Toaster } from 'react-hot-toast';

import { useSelector, useDispatch } from 'react-redux';
import Verification from './components/doctor/verification';
import PatientList from './components/doctor/showallpatients';
import PrescriptionTemplate from './components/doctor/prescriptionTemplate';
import PdfEditor from './components/doctor/pdfEditor';
import ManagePatients from './components/doctor/editableshowallpatient';
import NurseLoginRegister from './components/doctor/nurseloginReg';

const history = require('history').createBrowserHistory;

function App() {
	const [hits, setHits] = useState(0);
	const doctor = useSelector((state) => state.doctor.doctor);

	const incrementHitCount = async () => {
		try {
			const response = await fetch(ENDPOINT + '/api/hits', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
			});
			const data = await response.json();
			console.log('Current Hits:', data.hits);
		} catch (error) {
			console.error('Error updating hit count:', error);
		}
	};

	const normalise = (hits) => {
		if (!hits) return hits;
		const digits = Math.floor(Math.log10(hits)) + 1;
		return [...Array(Math.max(0, 5 - digits)).keys()].map(() => '0').join('') + hits;
	};

	useEffect(() => {
		const fetchHits = async () => {
			try {
				const response = await axios.get(ENDPOINT + '/api/hits');
				const { hits } = response.data;
				if (hits) {
					setHits(Math.floor(hits/2));
				}
			} catch (err) {
				console.log(err);
			}
		};
		fetchHits();
		incrementHitCount(); // Increment on mount
	 // Fetch the current hits
	}, []);

	// useEffect(() => {
	//   $(window).on("load", function () {
	//     $(window).scroll(function () {
	//       var windowBottom = $(this).scrollTop() + $(this).innerHeight();
	//       $(".animate").each(function () {
	//         /* Check the location of each desired element */
	//         var objectBottom = $(this).offset().top;

	//         /* If the element is completely within bounds of the window, fade it in */
	//         if (objectBottom < windowBottom) { //object comes into view (scrolling down)
	//           $(this).removeClass('animate').addClass('fadeInUp')
	//         } else { //object goes out of view (scrolling up)
	//           // if ($(this).css("opacity")==1) {$(this).fadeTo(500,0);}
	//         }
	//       });
	//     }).scroll(); //invoke scroll-handler on page-load
	//   });
	// }, []);

	// const { doctor } = useContext(DoctorAuthContext)
	const datapres = {
		patient_Id: "bhataram_8442054354",
		date: "12/9/2024",
		time: "3:28 PM",
		Visit: "First",
		Address: "Siner-Dharna",
		Gender: "Male",
		Consulted_via: "Telemedicine Portal",
		name: "bhataram",
		age: 28,
		phone: "8442054354",
		Bp: "126/82",
		pulseRate: 103,
		Spo2: 98,
		ECG: "NIL",
		pastHistory: "no past history",
		diagnosis: "headache, common cold, wound on leg",
		advice: "Gargle with warm salt water, clean and dress the wound, take rest",
		prescriptions: [
			{ saltName: "Azithromycin 500mg", dosage: "OD", remarks: "" },
			{ saltName: "Paracetamol + ibuprofen", dosage: "SOS", remarks: "" },
			{ saltName: "Levocetirizine 5mg", dosage: "BD", remarks: "" },
			{ saltName: "Iodine povidine", dosage: "BD", remarks: "x5 days" },
		],
		Signature: "Dr. Dileep Seervi",
	};
	return (
		<div className="App">
			<Toaster />
			<Router history={history}>
				<Route
					render={({ location }) => (
						<div className="Almighty-Router">
							<Navbar />
							{/* <Banner /> */}
							<Route exact path="/" render={() => <Redirect to="/" />} />
							<Switch location={location}>
								<Route exact path="/" render={(props) => <Home {...props} />} />
								<Route exact path="/doctor" render={(props) => <Doctor {...props} />} />
								<Route
									exact
									path="/doctor-persona"
									render={
										doctor ? (props) => <Persona {...props} /> : () => <Redirect to="/doctor" />
									}
								/>
								<Route
									exact
									path="/doctor-verification"
									render={
										doctor
											? (props) => <Verification {...props} />
											: () => <Redirect to="/doctor" />
									}
								/>
								<Route exact path="/admin_dashboard" render={(props) => <Admin {...props} />} />
								{/* <Route exact path="/links" render={(props) => <Links {...props} />} /> */}
								<Route exact path="/faq" render={(props) => <FAQ {...props} />} />
								<Route
									exact
									path="/acknowledgement"
									render={(props) => <Acknowledgement {...props} />}
								/>
								<Route exact path="/patients" render={(props) => <PatientList {...props} />}/>
								<Route exact path="/presTemplate" render={(props) => <PrescriptionTemplate  data={datapres }{...props} />}/>
								<Route exact path="/pdfEditor" render={(props) => <PdfEditor {...props} />}/>
								<Route exact path="/managePatients" render={(props) => <ManagePatients {...props} />}/>
								<Route exact path="/nurseLogin" render={(props) => <NurseLoginRegister {...props} />}/>
							</Switch>
						</div>
					)}
				/>
			</Router>
			<footer className="fadeInUp" style={{ animationDelay: '0s' }}>
				{/*<h6>हम आपके साथ हैं।</h6>*/}
				<div className="logo-display">
					{/*<a href="https://www.aiimsjodhpur.edu.in" target="_noblank">*/}
					{/*	<img src="/images/aiims-logo.png" alt="aiims j logo" />*/}
					{/*</a>*/}
					{/*<a href="http://iitj.ac.in" target="_noblank">*/}
					{/*	<img src="/images/iitj-logo.png" alt="iit j logo" />*/}
					{/*</a>*/}
				</div>
				<br />
				{/*<div className="footer-sources">*/}
				{/*	<h6 className="sources">सूचना के स्रोत: </h6>*/}
				{/*	<div id="footerButtons">*/}
				{/*		<a href="https://who.int" target="_noblank">*/}
				{/*			<img src="/images/who-logo.svg" className="who-logo" alt="W H O" />*/}
				{/*		</a>*/}
				{/*		<a href="https://www.mohfw.gov.in/" target="_noblank">*/}
				{/*			<img src="/images/mohfw-logo.jpg" className="mohfw-logo" alt="ministry of health and family welfare"/>*/}
				{/*		</a>*/}
				{/*		/!*<a href="https://www.covid19india.org/" target="_noblank">*!/*/}
				{/*		/!*	<img src="/images/covid19.ico" className="mohfw-logo" />*!/*/}
				{/*		/!*</a>*!/*/}
				{/*	</div>*/}
				{/*</div>*/}
				<div className="hits">
					<h6 className="sources">Total web hits: {normalise(hits)}</h6>
				</div>
			</footer>
		</div>
	);
}

export default App;
