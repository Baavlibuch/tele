import React from 'react';
// import $ from 'jquery';

function Acknowledgement(props) {
	return (
		<div className="Acknowledgment">
			<div className="fadeInUp faq">
				<h1>स्वीकृति</h1>
				<h3>टीम का विवरण /Team details</h3>
			</div>

			<div className="faq fadeInUp" style={{ animationDelay: `0.5s` }}>
				<h2 className="question">तकनीकी टीम</h2>
				<div className="portfolio-holder">
					<div>
						<a href="https://www.linkedin.com/in/manik-sejwal-1896b7135/" target="_noblank">
							<h2>Manik Sejwal</h2>
						</a>
						<h2 className="answer">डिवेलॅप्मॅन्ट एवं इंजीनियरिंग</h2>
						<h3>
							पीएचडी छात्र
							<br />
							चिकित्सा प्रौद्योगिकी विभाग <br /> IIT जोधपुर <br /> AIIMS जोधपुर
						</h3>
					</div>
					<div>
						<a href="https://www.linkedin.com/in/harsh-saxena-25128978/" target="_noblank">
							<h2>Harsh Saxena</h2>
						</a>
						<h2 className="answer">डिवेलॅप्मॅन्ट एवं इंजीनियरिंग</h2>
						<h3>
							पीएचडी छात्र
							<br />
							चिकित्सा प्रौद्योगिकी विभाग <br /> IIT जोधपुर <br /> AIIMS जोधपुर
						</h3>
					</div>
					<div>
						<a href="http://home.iitj.ac.in/~tawatia.1" target="_noblank">
							<h2>Kunal Tawatia</h2>
						</a>
						<h2 className="answer">डिवेलॅप्मॅन्ट एवं इंजीनियरिंग</h2>
						<h3>
							B.Tech. CSE 2018
							<br />
							कंप्यूटर विज्ञान और इंजीनियरिंग विभाग <br /> IIT जोधपुर
						</h3>
					</div>
				</div>
				<div>
					<a href="https://www.linkedin.com/in/mitanshu-sharma-21b97917/" target="_noblank">
						<h2>Mitanshu Sharma</h2>
					</a>
					<h2 className="answer">डिवेलॅप्मॅन्ट एवं इंजीनियरिंग</h2>
					<h3>
						पीएचडी छात्र
						<br />
						चिकित्सा प्रौद्योगिकी विभाग <br /> IIT जोधपुर <br /> AIIMS जोधपुर
					</h3>
				</div>
				<div className="portfolio-holder" style={{ marginTop: '2rem' }}>
					<img
						className="portfolio"
						src="/images/software-inn.png"
						style={{ border: 'none' }}
						alt="Software Innovations Lab"
					/>
					<div>
						<a href="http://home.iitj.ac.in/~sumitk" target="_noblank">
							<h2>Software Innovation Lab</h2>
						</a>
						<h3>IIT जोधपुर</h3>
					</div>
				</div>
			</div>
			<br />
			<div className="faq fadeInUp" style={{ animationDelay: `0.5s` }}>
				<h2 className="question">मेंटर्स</h2>
				<div className="portfolio-holder">
					<div>
						<h2>Prof. Santanu Chaudhury</h2>
						<h2 className="answer">निदेशक, IIT जोधपुर</h2>
						<h3>
							प्रोफेसर, संगणक विज्ञान एवं अभियांत्रिकी विभाग, IIT जोधपुर
							<br />
							प्रोफेसर, विद्युत अभियान्त्रिकी विभाग, IIT दिल्ली (लिअन)
							<br />
							पूर्व निदेशक, सीएसआईआर-सीईईआरआई पिलानी
							<br />
							FNAE, FNASc, FIAPR
						</h3>
					</div>
					<div>
						<a href="http://home.iitj.ac.in/~sumitk" target="_noblank">
							<h2>Dr. Sumit Kalra</h2>
						</a>
						<h2 className="answer">परियोजना अन्वेषक</h2>
						<h3>
							सहायक प्रोफेसर
							<br />
							कंप्यूटर विज्ञान और इंजीनियरिंग विभाग <br />
							IIT जोधपुर
						</h3>
					</div>
				</div>
			</div>
			<br />

			<div className="faq fadeInUp" style={{ animationDelay: `0.5s` }}>
				<h2 className="question">नैदानिक सहायता</h2>
				<div className="portfolio-holder">
					<div>
						<a href="" target="_noblank">
							<h2>Dr. Kuldeep Singh</h2>
						</a>
						<h2 className="answer">Dean (Academics)</h2>
						<h3>AIIMS जोधपुर</h3>
					</div>
					<div>
						<a href="" target="_noblank">
							<h2>Dr. Amit Goyal</h2>
						</a>
						<h2 className="answer">HOD ENT</h2>
						<h3>AIIMS जोधपुर</h3>
					</div>
					<div>
						<a href="" target="_noblank">
							<h2>Dr. Palak Gupta</h2>
						</a>
						<h2 className="answer">SR ENT</h2>
						<h3>AIIMS जोधपुर</h3>
					</div>
				</div>
			</div>

			<br />
			<div className="faq fadeInUp" style={{ animationDelay: `0.5s` }}>
				<h2 className="question">प्रायोजक और सहायता</h2>
				<h2>Dr. Ashish Agarwal</h2>
				<h2 className="answer">संस्थापक और मुख्य कार्यकारी अधिकारी</h2>
				<h3>NPBridge</h3>
				<br />
				<h2>Mr. Ravi Mula</h2>
				<h3>NPBridge</h3>
			</div>
		</div>
	);
}

export default Acknowledgement;
