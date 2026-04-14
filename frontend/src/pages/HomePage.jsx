import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const HomePage = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div style={styles.wrapper}>
            {/* Navbar */}
            <nav style={styles.navbar}>
                <div style={styles.navLogo}>
                    <span>🏥</span>
                    <span style={styles.navLogoText}>GoldenHour</span>
                </div>
                <div style={styles.navRight}>
                    <span style={styles.welcomeText}>👋 Hello, {user?.name}</span>
                    <button
                        style={styles.dashboardBtn}
                        onClick={() => navigate('/dashboard')}
                    >
                        👤 Dashboard
                    </button>
                    <button style={styles.logoutBtn} onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            </nav>

            {/* Hero */}
            <div style={styles.hero}>
                <h1 style={styles.heroTitle}>
                    Welcome to <span style={styles.highlight}>GoldenHour</span>
                </h1>
                <p style={styles.heroSub}>
                    A Community-Powered Emergency Medical Resource Network
                </p>
                {user?.bloodType && (
                    <div style={styles.bloodBadge}>
                        🩸 Your Blood Type: <strong>{user.bloodType}</strong>
                    </div>
                )}
            </div>

            {/* Blood Donation Section */}
            <div style={styles.sectionContainer}>
                <h2 style={styles.sectionTitle}>🩸 Blood Donation Network</h2>
                <div style={styles.actionRow}>
                    <div style={styles.actionCard}>
                        <span style={styles.actionIcon}>📋</span>
                        <h3 style={styles.actionTitle}>Register as Donor</h3>
                        <p style={styles.actionDesc}>
                            Join the donor network with your health information
                            and help save lives in emergencies.
                        </p>
                        <button
                            style={styles.actionBtn}
                            onClick={() => navigate('/donor/register')}
                        >
                            Register as Donor
                        </button>
                    </div>

                    <div style={styles.actionCard}>
                        <span style={styles.actionIcon}>🔍</span>
                        <h3 style={styles.actionTitle}>Find Blood Donors</h3>
                        <p style={styles.actionDesc}>
                            Search for available and eligible blood donors
                            near you by blood type and location.
                        </p>
                        <button
                            style={{ ...styles.actionBtn, backgroundColor: '#A1C398' }}
                            onClick={() => navigate('/donor/find')}
                        >
                            Find Donors
                        </button>
                    </div>


                </div>
            </div>

            {/* Emergency Section */}
            <div style={styles.sectionContainer}>
                <h2 style={styles.sectionTitle}>🚨 Emergency Blood Requests</h2>
                <div style={styles.actionRow}>
                    <div style={styles.actionCard}>
                        <span style={styles.actionIcon}>🚨</span>
                        <h3 style={styles.actionTitle}>Emergency Board</h3>
                        <p style={styles.actionDesc}>
                            View all active emergency blood requests and
                            respond if you are an eligible donor.
                        </p>
                        <button
                            style={styles.actionBtn}
                            onClick={() => navigate('/emergency')}
                        >
                            View Emergency Board
                        </button>
                    </div>

                    <div style={styles.actionCard}>
                        <span style={styles.actionIcon}>📢</span>
                        <h3 style={styles.actionTitle}>Request Blood Urgently</h3>
                        <p style={styles.actionDesc}>
                            Create an emergency blood request and alert
                            all matching donors in your area instantly.
                        </p>
                        <button
                            style={{ ...styles.actionBtn, backgroundColor: '#E67E22' }}
                            onClick={() => navigate('/emergency/create')}
                        >
                            Create Emergency Request
                        </button>
                    </div>
                </div>
            </div>

            {/* Camp Section */}
            <div style={styles.sectionContainer}>
                <h2 style={styles.sectionTitle}>🩸 Blood Donation Camps</h2>
                <div style={styles.actionRow}>
                    <div style={styles.actionCard}>
                        <span style={styles.actionIcon}>📋</span>
                        <h3 style={styles.actionTitle}>Browse Camps</h3>
                        <p style={styles.actionDesc}>
                            Find upcoming blood donation camps near you and register to donate.
                        </p>
                        <button style={styles.actionBtn} onClick={() => navigate('/camps')}>
                            View Camps
                        </button>
                    </div>
                    <div style={styles.actionCard}>
                        <span style={styles.actionIcon}>🏕️</span>
                        <h3 style={styles.actionTitle}>Organize a Camp</h3>
                        <p style={styles.actionDesc}>
                            Set up a blood donation camp for your organization, university, or community.
                        </p>
                        <button
                            style={{ ...styles.actionBtn, backgroundColor: '#27AE60' }}
                            onClick={() => navigate('/camps/create')}
                        >
                            Create Camp
                        </button>
                    </div>
                </div>
            </div>

            {/* Blood Bank Section */}
            <div style={styles.sectionContainer}>
                <h2 style={styles.sectionTitle}>🏦 Blood Bank Inventory</h2>
                <div style={styles.actionRow}>
                    <div style={styles.actionCard}>
                        <span style={styles.actionIcon}>🏦</span>
                        <h3 style={styles.actionTitle}>Blood Bank Board</h3>
                        <p style={styles.actionDesc}>
                            Check real-time blood stock levels at registered blood banks near you.
                        </p>
                        <button style={styles.actionBtn} onClick={() => navigate('/bloodbanks')}>
                            View Blood Banks
                        </button>
                    </div>
                    <div style={styles.actionCard}>
                        <span style={styles.actionIcon}>⚙️</span>
                        <h3 style={styles.actionTitle}>Manage Your Bank</h3>
                        <p style={styles.actionDesc}>
                            Register your blood bank and update your stock levels in real-time.
                        </p>
                        <button
                            style={{ ...styles.actionBtn, backgroundColor: '#E67E22' }}
                            onClick={() => navigate('/bloodbank/dashboard')}
                        >
                            Blood Bank Dashboard
                        </button>
                    </div>
                </div>
            </div>

            {/* Antivenom Section */}
            <div style={styles.sectionContainer}>
                <h2 style={styles.sectionTitle}>🐍 Snake Bite & Antivenom</h2>
                <div style={styles.actionRow}>
                    <div style={styles.actionCard}>
                        <span style={styles.actionIcon}>🐍</span>
                        <h3 style={styles.actionTitle}>Antivenom Finder</h3>
                        <p style={styles.actionDesc}>
                            Identify the snake, get first aid instructions, and find the nearest hospital with antivenom.
                        </p>
                        <button style={styles.actionBtn} onClick={() => navigate('/antivenom')}>
                            Find Antivenom
                        </button>
                    </div>
                    <div style={styles.actionCard}>
                        <span style={styles.actionIcon}>🏥</span>
                        <h3 style={styles.actionTitle}>Register Stock</h3>
                        <p style={styles.actionDesc}>
                            Hospital staff can register and update their antivenom stock to help emergency cases.
                        </p>
                        <button
                            style={{ ...styles.actionBtn, backgroundColor: '#27AE60' }}
                            onClick={() => navigate('/antivenom/register')}
                        >
                            Register Hospital
                        </button>
                    </div>
                </div>
            </div>

            {/* Medicine Section */}
            <div style={styles.sectionContainer}>
                <h2 style={styles.sectionTitle}>💊 Rare Medicine Finder</h2>
                <div style={styles.actionRow}>
                    <div style={styles.actionCard}>
                        <span style={styles.actionIcon}>🔍</span>
                        <h3 style={styles.actionTitle}>Find Medicine</h3>
                        <p style={styles.actionDesc}>
                            Search for rare and critical medicines across hospitals and pharmacies near you.
                        </p>
                        <button style={styles.actionBtn} onClick={() => navigate('/medicines')}>
                            Search Medicines
                        </button>
                    </div>
                    <div style={styles.actionCard}>
                        <span style={styles.actionIcon}>💊</span>
                        <h3 style={styles.actionTitle}>List Your Stock</h3>
                        <p style={styles.actionDesc}>
                            Hospitals and pharmacies can list rare medicines to help patients find them quickly.
                        </p>
                        <button
                            style={{ ...styles.actionBtn, backgroundColor: '#27AE60' }}
                            onClick={() => navigate('/medicines/add')}
                        >
                            Add Medicine Listing
                        </button>
                    </div>
                    <div style={styles.actionCard}>
                        <span style={styles.actionIcon}>🔄</span>
                        <h3 style={styles.actionTitle}>Medicine Alternatives</h3>
                        <p style={styles.actionDesc}>
                            Find generic equivalents and alternate brands when your medicine is out of stock.
                        </p>
                        <button
                            style={{ ...styles.actionBtn, backgroundColor: '#E67E22' }}
                            onClick={() => navigate('/medicines/alternatives')}
                        >
                            Find Alternatives
                        </button>
                    </div>
                </div>
            </div>

            {/* Near-Expiry Section */}
            <div style={styles.sectionContainer}>
                <h2 style={styles.sectionTitle}>♻️ Near-Expiry Medicine</h2>
                <div style={styles.actionRow}>
                    <div style={styles.actionCard}>
                        <span style={styles.actionIcon}>♻️</span>
                        <h3 style={styles.actionTitle}>Claim Discounted Medicine</h3>
                        <p style={styles.actionDesc}>
                            Find medicines nearing expiry at reduced prices — help reduce waste and save money.
                        </p>
                        <button style={styles.actionBtn} onClick={() => navigate('/nearexpiry')}>
                            Browse Listings
                        </button>
                    </div>
                    <div style={styles.actionCard}>
                        <span style={styles.actionIcon}>🏥</span>
                        <h3 style={styles.actionTitle}>Post Near-Expiry Stock</h3>
                        <p style={styles.actionDesc}>
                            Hospitals and pharmacies can post medicines nearing expiry to reduce waste.
                        </p>
                        <button
                            style={{ ...styles.actionBtn, backgroundColor: '#27AE60' }}
                            onClick={() => navigate('/nearexpiry/post')}
                        >
                            Post Medicine
                        </button>
                    </div>
                </div>
            </div>

            {/* Hospital Section */}
            <div style={styles.sectionContainer}>
                <h2 style={styles.sectionTitle}>🏥 Hospital Resource Tracker</h2>
                <div style={styles.actionRow}>
                    <div style={styles.actionCard}>
                        <span style={styles.actionIcon}>🏥</span>
                        <h3 style={styles.actionTitle}>Hospital Dashboard</h3>
                        <p style={styles.actionDesc}>
                            Check real-time bed, ICU, CCU, ventilator and oxygen availability at hospitals near you.
                        </p>
                        <button style={styles.actionBtn} onClick={() => navigate('/hospitals')}>
                            View Hospitals
                        </button>
                    </div>
                    <div style={styles.actionCard}>
                        <span style={styles.actionIcon}>📊</span>
                        <h3 style={styles.actionTitle}>Manage Your Hospital</h3>
                        <p style={styles.actionDesc}>
                            Hospital staff can register and update real-time resource availability data.
                        </p>
                        <button
                            style={{ ...styles.actionBtn, backgroundColor: '#2980b9' }}
                            onClick={() => navigate('/hospitals/dashboard')}
                        >
                            Hospital Dashboard
                        </button>
                    </div>
                </div>
            </div>
            {/* Equipment Section */}
            <div style={styles.sectionContainer}>
                <h2 style={styles.sectionTitle}>⚕️ Medical Equipment</h2>
                <div style={styles.actionRow}>
                    <div style={styles.actionCard}>
                        <span style={styles.actionIcon}>⚕️</span>
                        <h3 style={styles.actionTitle}>Find Equipment</h3>
                        <p style={styles.actionDesc}>
                            Search for oxygen cylinders, dialysis machines, NICU beds and more near you.
                        </p>
                        <button style={styles.actionBtn} onClick={() => navigate('/equipment')}>
                            Find Equipment
                        </button>
                    </div>
                    <div style={styles.actionCard}>
                        <span style={styles.actionIcon}>🏪</span>
                        <h3 style={styles.actionTitle}>List Your Equipment</h3>
                        <p style={styles.actionDesc}>
                            Hospitals and vendors can list available medical equipment for booking.
                        </p>
                        <button
                            style={{ ...styles.actionBtn, backgroundColor: '#2980b9' }}
                            onClick={() => navigate('/equipment/add')}
                        >
                            List Equipment
                        </button>
                    </div>
                </div>
            </div>

            

            {/* Coming Soon Features */}
            <div style={styles.sectionContainer}>
                <h2 style={styles.sectionTitle}>🚀 More Features Coming Soon</h2>
                <div style={styles.grid}>
                    {comingSoon.map((f, i) => (
                        <div key={i} style={styles.card}>
                            <span style={styles.cardIcon}>{f.icon}</span>
                            <h3 style={styles.cardTitle}>{f.title}</h3>
                            <p style={styles.cardDesc}>{f.desc}</p>
                            <button style={styles.cardBtn}>Coming Soon</button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const comingSoon = [
    {
        icon: '📢',
        title: 'Emergency Blood Broadcast',
        desc: 'Send urgent alerts to all matching donors in your area instantly.',
    },
    {
        icon: '🏕️',
        title: 'Blood Donation Camps',
        desc: 'Browse and register for upcoming blood donation camps near you.',
    },
    {
        icon: '🏆',
        title: 'Donor Achievements',
        desc: 'Track your donation history and earn badges for milestones.',
    },
    {
        icon: '🏦',
        title: 'Blood Bank Dashboard',
        desc: 'Real-time blood stock levels across registered blood banks.',
    },
    {
        icon: '💊',
        title: 'Rare Medicine Finder',
        desc: 'Locate hard-to-find medicines across hospitals and pharmacies.',
    },
    {
        icon: '🏨',
        title: 'Hospital Resource Tracker',
        desc: 'Check real-time ICU, bed and oxygen availability.',
    },
];

const styles = {
    wrapper: {
        minHeight: '100vh',
        backgroundColor: '#FEFDEC',
        fontFamily: 'sans-serif',
    },
    navbar: {
        backgroundColor: '#FA7070',
        padding: '14px 32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    },
    navLogo: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '20px',
    },
    navLogoText: {
        fontWeight: 'bold',
        color: '#fff',
        fontSize: '20px',
    },
    navRight: {
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
    },
    welcomeText: {
        color: '#fff',
        fontSize: '14px',
        fontWeight: '500',
    },
    logoutBtn: {
        backgroundColor: '#fff',
        color: '#FA7070',
        border: 'none',
        borderRadius: '8px',
        padding: '8px 16px',
        fontWeight: 'bold',
        cursor: 'pointer',
        fontSize: '13px',
    },
    hero: {
        textAlign: 'center',
        padding: '50px 20px 30px',
    },
    heroTitle: {
        fontSize: '36px',
        fontWeight: 'bold',
        color: '#333',
        marginBottom: '12px',
    },
    highlight: {
        color: '#FA7070',
    },
    heroSub: {
        fontSize: '16px',
        color: '#666',
        marginBottom: '20px',
    },
    bloodBadge: {
        display: 'inline-block',
        backgroundColor: '#fff',
        border: '1.5px solid #FA7070',
        borderRadius: '20px',
        padding: '6px 18px',
        fontSize: '14px',
        color: '#FA7070',
    },
    sectionContainer: {
        maxWidth: '1000px',
        margin: '0 auto',
        padding: '20px 40px',
    },
    sectionTitle: {
        fontSize: '20px',
        fontWeight: 'bold',
        color: '#333',
        marginBottom: '20px',
        paddingBottom: '10px',
        borderBottom: '2px solid #C6EBC5',
    },
    actionRow: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '24px',
        marginBottom: '20px',
    },
    actionCard: {
        backgroundColor: '#fff',
        borderRadius: '16px',
        padding: '28px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
        border: '1px solid #C6EBC5',
        textAlign: 'center',
    },
    actionIcon: {
        fontSize: '40px',
    },
    actionTitle: {
        fontSize: '17px',
        fontWeight: 'bold',
        color: '#333',
        margin: '12px 0 8px',
    },
    actionDesc: {
        fontSize: '13px',
        color: '#888',
        lineHeight: '1.6',
        marginBottom: '20px',
    },
    actionBtn: {
        backgroundColor: '#FA7070',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        padding: '10px 24px',
        fontWeight: 'bold',
        cursor: 'pointer',
        fontSize: '14px',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        paddingBottom: '40px',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: '16px',
        padding: '24px 20px',
        textAlign: 'center',
        boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
        border: '1px solid #C6EBC5',
    },
    cardIcon: {
        fontSize: '32px',
    },
    cardTitle: {
        fontSize: '14px',
        fontWeight: 'bold',
        color: '#333',
        margin: '10px 0 8px',
    },
    cardDesc: {
        fontSize: '12px',
        color: '#888',
        lineHeight: '1.6',
        marginBottom: '16px',
    },
    cardBtn: {
        backgroundColor: '#C6EBC5',
        color: '#3a7a38',
        border: 'none',
        borderRadius: '8px',
        padding: '7px 14px',
        fontSize: '11px',
        fontWeight: 'bold',
        cursor: 'pointer',
    },
    dashboardBtn: {
        backgroundColor: 'transparent',
        color: '#fff',
        border: '1.5px solid #fff',
        borderRadius: '8px',
        padding: '8px 16px',
        fontWeight: 'bold',
        cursor: 'pointer',
        fontSize: '13px',
    },
};

export default HomePage;