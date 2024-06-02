import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { ENDPOINT } from '../config';

export default function DocRtc() {
    const [doctors, setDoctors] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        getDoctors();
    }, [1]);

    const getDoctors = () => {
        axios
			.get(ENDPOINT + '/api/Alldoctor-list')
			.then((response) => {
				const { doctors } = response.data;
				if (doctors) {
					setDoctors( doctors );
				}
			})
			.catch((err) => {
				console.log(err);
			});
    };
    const itemsPerPage = 25;
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentDoctors = doctors.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(doctors.length / itemsPerPage);
    return (
        <>
            <div className="tablecontainer">

                <div className="tablegrid">
                    <div className="tablehead">
                        <div className='htext'>NAME</div>
                        <div className='htext'>STATUS</div>
                        <div className='htext'>NUMBER</div>
                    </div>
                    {
                        currentDoctors.map((doc, index) => {
                            return (
                                <div key={index} className="tablerow">
                                    <div className="ctext">{doc.name}</div>
                                    <div className="ctext">{
                                        doc.attending
                                        === 'online' ? (
                                            <div className='ofcontainer'><div className='gdot'></div><div className='oftext'>online</div></div>
                                        )
                                            :
                                            (
                                                <div className='ofcontainer'><div className='rdot'></div><div className='oftext'>offline</div></div>
                                            )

                                    }
                                    </div>
                                    <div className="ctextq">
                                        {doc.telephone}
                                        <a href={`tel:${doc.telephone}`} className="callnow-btn">Call Now</a>
                                    </div>
                                </div>
                            )
                        })
                    }
                </div>
            </div>
            <div className="pagination">
                {Array.from({ length: totalPages }, (_, i) => (
                    <button
                        key={i}
                        onClick={() => setCurrentPage(i + 1)}
                        className={currentPage === i + 1 ? 'active' : ''}
                    >
                        {i + 1}
                    </button>
                ))}
            </div>
        </>
    );
}