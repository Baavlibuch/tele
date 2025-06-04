/**
 * Admin Nurse Row Component
 * This file implements a single row for the nurse table in the admin dashboard.
 * Handles rendering, editing, and deleting a nurse's information.
 */
import React, { useState, useEffect } from 'react';
import * as Icon from 'react-feather';

const villages = [
  "Siner",
  "Siner-Dharna",
  "Siner-Baliyana",
  "Siner-Gura",
  "Siner-thanmata Hinglaj"
];

function NurseRow(props) {
  const [nurse, setNurse] = useState(props.nurse);
  const [username, setUsername] = useState(props.nurse.username);
  const [password, setPassword] = useState(props.nurse.password);
  const [village, setVillage] = useState(props.nurse.village);
  const [editing, setEditing] = useState(props.nurse._id ? false : true);

  useEffect(() => {
    setNurse(props.nurse);
    setUsername(props.nurse.username);
    setPassword(props.nurse.password);
    setVillage(props.nurse.village);
    setEditing(props.nurse._id ? false : true);
  }, [props.nurse]);

  return (
    <tr className="nurse">
      <td>
        {editing ? (
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        ) : (
          nurse.username
        )}
      </td>
      <td>
        {editing ? (
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        ) : (
          nurse.password
        )}
      </td>
      <td>
        {editing ? (
          <select
            value={village}
            onChange={(e) => setVillage(e.target.value)}
          >
            <option value="" disabled>Select a village</option>
            {villages.map((villageOption) => (
              <option key={villageOption} value={villageOption}>
                {villageOption}
              </option>
            ))}
          </select>
        ) : (
          nurse.village
        )}
      </td>
      <td>
        {editing ? (
          <button
            onClick={() => {
              props.edit({
                ...nurse,
                username,
                password,
                village,
              });
              setEditing(false);
            }}
            style={{ background: 'none', padding: 0 }}
          >
            <Icon.Save size={16} />
          </button>
        ) : (
          <button
            onClick={() => setEditing(true)}
            style={{ background: 'none', padding: 0 }}
          >
            <Icon.Settings size={16} />
          </button>
        )}
        <button
          onClick={() => props.delete(nurse._id)}
          style={{ background: 'none', padding: 0 }}
        >
          <Icon.Trash size={16} />
        </button>
      </td>
    </tr>
  );
}

export default NurseRow;
