import React, { useState } from 'react'
import './index.css'

interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  bloodGroup: string;
  gender: string;
  dob: string;
}

interface BillingRecord {
  id: number;
  amount: number;
  status: string;
  dueDate: string;
}

interface PatientDetail {
  patient: Patient;
  billingRecords: BillingRecord[];
  billingStatus: 'SUCCESS' | 'FALLBACK';
}

function App() {
  const [patientId, setPatientId] = useState('')
  const [data, setData] = useState<PatientDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchPatientData = async () => {
    if (!patientId) return
    setLoading(true)
    setError('')
    setData(null)

    try {
      const response = await fetch(`http://localhost:8081/api/patients/${patientId}`)
      if (!response.ok) {
        if (response.status === 404) throw new Error('Patient not found')
        throw new Error('Service connection failed')
      }
      const result = await response.json()
      setData(result)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') fetchPatientData()
  }

  return (
    <div className="app-container">
      <nav className="navbar">
        <div className="nav-brand">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="24" height="24" rx="6" fill="#2563EB"/>
            <path d="M12 7V17M7 12H17" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
          MedTrack <span>Pro</span>
        </div>
        
        <div className="search-bar">
          <input 
            type="text" 
            placeholder="Enter Patient ID (e.g., P101)" 
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            onKeyPress={handleKeyPress}
          />
        </div>

        <div className="nav-actions">
          <div className="user-profile">AD</div>
        </div>
      </nav>

      <main className="dashboard-main">
        {data ? (
          <>
            <div className="dashboard-header">
              <h2>Dashboard Overview</h2>
              <p>Showing information for Patient: <strong>{data.patient.name} ({data.patient.id})</strong></p>
            </div>

            <div className="content-grid">
              <section className="card">
                <div className="card-header">
                  <h3>Patient Details</h3>
                  <a href="#" className="edit-link">Edit Info</a>
                </div>
                
                <div className="info-row">
                  <div className="info-label">Full Name</div>
                  <div className="info-value">{data.patient.name}</div>
                </div>
                
                <div className="info-row">
                  <div className="info-label">Identity ID</div>
                  <div className="info-value">{data.patient.id}</div>
                </div>

                <div className="info-row">
                  <div className="info-label">Blood Type</div>
                  <div className="info-value">{data.patient.bloodGroup}</div>
                </div>

                <div className="info-row">
                  <div className="info-label">Residential Address</div>
                  <div className="info-value">
                    {data.patient.address}
                  </div>
                </div>

                <div className="info-row">
                  <div className="info-label">Contact</div>
                  <div className="info-value">{data.patient.phone}</div>
                </div>
              </section>

              <section className="card">
                <div className="card-header">
                  <h3>Billing Information</h3>
                  <span className="info-label" style={{background: '#f1f5f9', padding: '0.2rem 0.5rem', borderRadius: '4px'}}>Q1 2026</span>
                </div>

                {data.billingStatus === 'FALLBACK' && (
                  <div className="status-banner warning">
                    <span>⚠️</span>
                    Billing service unreachable - displaying last known status from cache.
                  </div>
                )}

                <div className="invoice-preview">
                  {data.billingRecords.length > 0 ? (
                    data.billingRecords.map((record, index) => (
                      <div key={record.id} style={{ marginBottom: index !== data.billingRecords.length - 1 ? '2rem' : '0' }}>
                        <div className="invoice-id">INVOICE ID</div>
                        <div className="invoice-meta">
                          <div className="info-value">#INV-2026-{String(record.id).padStart(5, '0')}</div>
                          <div className="info-label">DATE ISSUED: {record.dueDate}</div>
                        </div>

                        <div className="total-due">
                          <div>
                            <div className="info-label">Total Outstanding Amount</div>
                            <div className="amount">${record.amount.toLocaleString()}</div>
                          </div>
                          <div className={`status-pill status-${record.status}`}>
                            {record.status === 'PENDING' ? '● Pending Payment' : record.status}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>No billing records found.</p>
                  )}
                  
                  <button className="btn-primary">Generate Detailed Invoice PDF</button>
                </div>
              </section>
            </div>
          </>
        ) : loading ? (
          <div className="empty-state">
            <p>Retrieving health records...</p>
          </div>
        ) : (
          <div className="empty-state">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" style={{marginBottom: '1rem', opacity: 0.2}}>
              <path d="M19 11H5M19 11C20.1046 11 21 11.8954 21 13V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V13C3 11.8954 3.89543 11 5 11M19 11V9C19 7.89543 18.1046 7 17 7M5 11V9C5 7.89543 5.89543 7 7 7M7 7V5C7 3.89543 7.89543 3 9 3H15C16.1046 3 17 3.89543 17 5V7M7 7H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <h3>No Patient Selected</h3>
            <p>Please enter a Patient ID in the search bar above to view clinical and financial records.</p>
          </div>
        )}
      </main>

      <footer className="app-footer">
        <div>© 2026 MedTrack Pro Systems Inc. | Privacy Policy | HIPAA Compliance</div>
        <div className="system-status">
          <div className="status-dot"></div>
          All core systems operational
        </div>
      </footer>
    </div>
  )
}

export default App
