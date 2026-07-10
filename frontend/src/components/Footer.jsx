import React from 'react'

const Footer = () => {
  return (
    <footer>
      <p>© {new Date().getFullYear()} Somnath's Physique. All Rights Reserved.</p>
      <p>Address: Newtown, Coal India, Kolkata</p>
      <p style={{ fontSize: "12px", marginTop: "5px", opacity: 0.7 }}>
        Designed And Developed By Mudabbir
      </p>
    </footer>
  );
}

export default Footer
