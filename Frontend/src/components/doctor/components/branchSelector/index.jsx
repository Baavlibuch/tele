import React, { useState, useEffect, useRef } from 'react';
import './index.scss';
import io from 'socket.io-client';
import { BeatLoader } from 'react-spinners';
import toast from 'react-hot-toast';

const socket = io.connect('/doctor/persona');

const BranchSelector = ({ setBranch, doctorId }) => {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedBranch, setSelectedBranch] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showBranchList, setShowBranchList] = useState(false);

  const dropdownRef = useRef(null);

  const filteredBranches = branches.filter((branch) =>
    branch.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleBranchSelect = (branch) => {
    setSelectedBranch(branch);
    setBranch(branch);
    setShowBranchList(false);
  };

  const handleAddNewBranch = () => {
    const newBranch = prompt('Enter the name of the new branch:');

    const branchData = {
      branch_name: newBranch,
      doctor_id: doctorId
    };

    socket.emit('create_branch', branchData, (res) => {

      if (res.status === 'error') {
        toast.error(res.message);
        return;
      }

      setBranches((prevBranches) => [...prevBranches, newBranch]);
      setSelectedBranch(newBranch);
      setBranch(newBranch);
    });
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setShowBranchList(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setLoading(true);
    socket.emit('get_branch_list', { doctor_id: doctorId }, (res) => {
      if (res.status === 'error') {
        toast.error(res.message);
        return;
      }
    });

    socket.on('got_branch_list', (data) => {
        setBranches(data);
        if (data.length > 0) {
          setSelectedBranch(data[0]);
          setBranch(data[0]);
        }
        setLoading(false);
    });
  }, [doctorId]);

 return (
    <div className="branch-selector" ref={dropdownRef}>
      <button className="dropdown-button" onClick={() => setShowBranchList(!showBranchList)}>
        <span className="dropdown-content-wrapper">
          <span className="dropdown-button-text">{selectedBranch || 'Select a branch'}</span>
          <span className="arrow-down-icon">&#9662;</span>
        </span>
      </button>
      {showBranchList && (
        <div className="dropdown-content">
          <input
            type="text"
            placeholder="Find or create a branch"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {loading ? (
            <div className="spinner-wrapper">
              <BeatLoader color="#007bff" />
            </div>
          ) : (
            <>
              <ul className="branch-list">
                {filteredBranches.map((branch) => (
                  <li key={branch} onClick={() => handleBranchSelect(branch)}>
                    {branch}
                  </li>
                ))}
              </ul>
              <button className="add-branch-button" onClick={handleAddNewBranch}>
                Add New Branch
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default BranchSelector;
