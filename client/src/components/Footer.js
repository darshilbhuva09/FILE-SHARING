import React from 'react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <p>© {new Date().getFullYear()} Quanta-Share. Simple, private file sharing.</p>
      </div>
    </footer>
  );
};

export default Footer;