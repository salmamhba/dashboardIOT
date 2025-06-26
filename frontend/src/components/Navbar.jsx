import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  MDBNavbar,
  MDBContainer,
  MDBNavbarBrand,
  MDBNavbarNav,
  MDBNavbarItem,
  MDBNavbarLink,
  MDBDropdown,
  MDBDropdownMenu,
  MDBDropdownToggle,
  MDBDropdownItem,
  MDBIcon,
} from 'mdb-react-ui-kit';
import Logo from '../assets/icon_black.png';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navbarStyle = {
    backgroundColor: 'var(--green-light)',
    color: 'var(--white-soft)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15), inset 0 -1px 0 rgba(255, 255, 255, 0.2)',
    position: 'relative',
    top: 0,
    width: '100%',
    zIndex: 1000,
    animation: 'fadeDown 0.6s ease',
    backdropFilter: 'blur(2px)',
    WebkitBackdropFilter: 'blur(2px)',
    transition: 'all 0.3s ease-in-out'
  };

  const text3DStyle = {
    textShadow: `
      1px 1px 0 #999,
      2px 2px 1px rgba(0,0,0,0.2),
      3px 3px 2px rgba(0,0,0,0.15)
    `,
    color: 'var(--white-soft)',
    fontWeight: 'bold',
    fontSize: '1.5rem',
    letterSpacing: '0.5px'
  };

  const linkStyle = {
    color: 'var(--white-soft)',
    fontWeight: '800',
    textDecoration: 'none',
    textShadow: '3px 3px 3px rgba(0,0,0,0.3)',
  };
  return (
    <MDBNavbar expand="lg" light style={navbarStyle}>
      <MDBContainer fluid>
        <MDBNavbarBrand
          tag={Link}
          to="/"
          className="d-flex align-items-center"
          style={{ color: 'var(--green-olive)' }}
        >
          <img src={Logo} alt="Logo" width="40" className="me-2" />
          <strong style={text3DStyle}>SmartHome AI</strong>
        </MDBNavbarBrand>

        <MDBNavbarNav right fullWidth={false} className="mb-2 mb-lg-0">
          <MDBNavbarItem>
            <MDBNavbarLink tag={Link} to="/" style={linkStyle}>
              Accueil
            </MDBNavbarLink>
          </MDBNavbarItem>

          {user && (
            <MDBNavbarItem>
              <MDBNavbarLink tag={Link} to="/dashboard" style={linkStyle}>
                Tableau de bord
              </MDBNavbarLink>
            </MDBNavbarItem>
          )}

          {!user ? (
            <>
              <MDBNavbarItem>
                <MDBNavbarLink tag={Link} to="/login" style={linkStyle}>
                  Connexion
                </MDBNavbarLink>
              </MDBNavbarItem>
              <MDBNavbarItem>
                <MDBNavbarLink tag={Link} to="/signup" style={linkStyle}>
                  Inscription
                </MDBNavbarLink>
              </MDBNavbarItem>
            </>
          ) : (
            <MDBDropdown>
              <MDBDropdownToggle
                tag="a"
                className="nav-link d-flex align-items-center"
                style={linkStyle}
                role="button"
              >
                <MDBIcon fas icon="user-circle" size="lg" className="me-2" />
                {user?.name || 'Utilisateur'}
              </MDBDropdownToggle>
              <MDBDropdownMenu>
                <MDBDropdownItem link onClick={() => navigate('/settings')}>
                  Paramètres
                </MDBDropdownItem>
                <MDBDropdownItem link onClick={handleLogout}>
                  Se déconnecter
                </MDBDropdownItem>
              </MDBDropdownMenu>
            </MDBDropdown>
          )}
        </MDBNavbarNav>
      </MDBContainer>
    </MDBNavbar>
  );
};

export default Navbar;
