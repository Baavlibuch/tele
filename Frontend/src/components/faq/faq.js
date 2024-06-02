import React, { useState, useEffect } from 'react';
import LazyLoad from 'react-lazy-load';
import faqs from './guidelines.json';

function FAQ() {
	const [faqList, setFaq] = useState([]);

	useEffect(() => {
		if (Array.isArray(faqs.faqs)) {
			setFaq(faqs.faqs);
		} else if (typeof faqs.faqs === 'object' && faqs.faqs !== null) {
			// Convert the object to an array or handle it as needed
			const faqArray = Object.values(faqs.faqs);
			setFaq(faqArray);
			console.log('faqArray', faqArray);
		} else {
			setFaq([]);
		}
	}, [faqs]); // Include faqs as a dependency if it might change
	// console.log('faqs', faqs.faqs);
	// console.log('faqList', faqList);
	return (
		<div className="FAQ">
			<div className="faq-left">
				<div className="video-holder">
					<LazyLoad offsetVertical={300}>
						<video
							src="/videos/who.mp4"
							controls={true}
							className="faq-video fadeInUp"
							style={{ animationDelay: '0.5s' }}
							data-testid="video-element"
						/>
					</LazyLoad>
					<div>
						<video
							src="/videos/vid1.mp4"
							controls={true}
							className="faq-video fadeInUp"
							style={{ animationDelay: '0.5s' }}
							data-testid="video-element"
						/>
						<video
							src="/videos/vid2.mp4"
							controls={true}
							className="faq-video fadeInUp"
							style={{ animationDelay: '0.5s' }}
							data-testid="video-element"
						/>
					</div>
					<div>
						<video
							src="/videos/vid5.mp4"
							controls={true}
							className="faq-video fadeInUp"
							style={{ animationDelay: '0.5s' }}
							data-testid="video-element"
						/>
						<video
							src="/videos/vid4.mp4"
							controls={true}
							className="faq-video fadeInUp"
							style={{ animationDelay: '0.5s' }}
							data-testid="video-element"
						/>
					</div>
					<div>
						<video
							src="/videos/vid3.mp4"
							controls={true}
							className="faq-video fadeInUp"
							style={{ animationDelay: '0.5s' }}
							data-testid="video-element"
						/>
						<video
							src="/videos/vid6.mp4"
							controls={true}
							className="faq-video fadeInUp"
							style={{ animationDelay: '0.5s' }}
							data-testid="video-element"
						/>
					</div>
				</div>
			</div>
			<div className="faq-right" style={{ animationDelay: `0.5s` }}>
				<div className="fadeInUp faq">
					<LazyLoad offsetVertical={200}>
						<img src="/images/mohfw-logo.jpg" className="mohfw-logo" alt={'MOHFW logo'} />
					</LazyLoad>
					<h3>द्वारा जनहित में जारी</h3>
					<h1>सामान्य प्रश्न</h1>
				</div>
				{!faqList.length ? (
					<div className="lds-dual-ring" />
				) : (
					faqList.map((faq, index) => {
						// console.log(faq.question);
						return (
							<div key={index} className=" fadeInUp faq" style={{ animationDelay: `0.5s` }}>
								<h2 className="question">{faq.question}</h2>
								<h2 className="answer">{faq.answer}</h2>
							</div>
						);
					})
				)}
			</div>
		</div>
	);
}

export default FAQ;
