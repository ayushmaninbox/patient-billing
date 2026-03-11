import React, { useState, useEffect } from 'react'
import './index.css'
import { jsPDF } from 'jspdf'

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
  const [isEditing, setIsEditing] = useState(false)
  const [editPatient, setEditPatient] = useState<Patient | null>(null)
  
  const [isAdding, setIsAdding] = useState(false)
  const [newPatient, setNewPatient] = useState<Patient>({
    id: '', name: '', email: '', phone: '', address: '', bloodGroup: '', gender: '', dob: ''
  })

  const fetchPatientData = async () => {
    if (!patientId) return
    setLoading(true)
    setError('')
    setData(null)
    setIsEditing(false)
    setIsAdding(false)

    try {
      const response = await fetch(`http://localhost:8081/api/patients/${patientId}`)
      if (!response.ok) {
        if (response.status === 404) throw new Error('Patient not found')
        throw new Error('Service connection failed')
      }
      const result = await response.json()
      setData(result)
      setEditPatient(result.patient)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSavePatient = async () => {
    if (!editPatient || !data) return
    try {
      const response = await fetch(`http://localhost:8081/api/patients/${data.patient.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editPatient)
      })
      if (!response.ok) throw new Error('Failed to update patient')
      const updated = await response.json()
      setData({ ...data, patient: updated })
      setIsEditing(false)
    } catch (err: any) {
      alert(err.message)
    }
  }

  const handleAddPatient = async () => {
    if (!newPatient.id || !newPatient.name) return alert('ID and Name are required')
    try {
      const response = await fetch(`http://localhost:8081/api/patients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPatient)
      })
      if (!response.ok) {
        const msg = await response.text()
        throw new Error(msg || 'Failed to add patient')
      }
      const saved = await response.json()
      alert(`Patient ${saved.name} added successfully!`)
      setPatientId(saved.id)
      setIsAdding(false)
      fetchPatientData()
    } catch (err: any) {
      alert(err.message)
    }
  }

  const generatePDF = () => {
    if (!data) return
    const doc = new jsPDF()
    const p = data.patient

    doc.setFontSize(22)
    doc.text('MedTrack Pro - Detailed Invoice', 105, 20, { align: 'center' })
    
    doc.setFontSize(14)
    doc.text(`Patient: ${p.name} (${p.id})`, 20, 40)
    doc.text(`Email: ${p.email}`, 20, 50)
    doc.text(`Phone: ${p.phone}`, 20, 60)
    doc.text(`Address: ${p.address}`, 20, 70)
    
    doc.line(20, 75, 190, 75)
    
    doc.setFontSize(16)
    doc.text('Billing Records', 20, 85)
    
    let y = 95
    data.billingRecords.forEach((record, i) => {
      doc.setFontSize(12)
      doc.text(`Invoice #INV-2026-${String(record.id).padStart(5, '0')}`, 20, y)
      doc.text(`Amount: $${record.amount.toLocaleString()}`, 20, y + 7)
      doc.text(`Status: ${record.status}`, 20, y + 14)
      doc.text(`Due Date: ${record.dueDate}`, 20, y + 21)
      y += 35
      if (y > 270) {
        doc.addPage()
        y = 20
      }
    })

    doc.save(`Invoice_${p.id}_${new Date().getTime()}.pdf`)
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
          <button className="btn-secondary" onClick={() => setIsAdding(!isAdding)}>
            {isAdding ? 'View Records' : 'Add Patient'}
          </button>
          <div className="user-profile">AD</div>
        </div>
      </nav>

      <main className="dashboard-main">
        {error && (
          <div className="status-banner error" style={{margin: '0 2rem 1rem'}}>
            <span>⚠️</span> {error}
          </div>
        )}

        {isAdding ? (
          <div className="add-patient-container">
            <div className="dashboard-header">
              <h2>Register New Patient</h2>
              <p>Complete the clinical profile to initiate records tracking.</p>
            </div>
            
            <section className="card add-form">
              <div className="grid-form">
                <div className="form-group">
                  <label>Patient ID (Unique)</label>
                  <input type="text" className="edit-input" placeholder="e.g. P104" value={newPatient.id} onChange={e => setNewPatient({...newPatient, id: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Full Name</label>
                  <input type="text" className="edit-input" placeholder="John Doe" value={newPatient.name} onChange={e => setNewPatient({...newPatient, name: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input type="email" className="edit-input" placeholder="john@example.com" value={newPatient.email} onChange={e => setNewPatient({...newPatient, email: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Contact Number</label>
                  <input type="text" className="edit-input" placeholder="+1..." value={newPatient.phone} onChange={e => setNewPatient({...newPatient, phone: e.target.value})} />
                </div>
                <div className="form-group" style={{gridColumn: 'span 2'}}>
                  <label>Home Address</label>
                  <textarea className="edit-input" placeholder="Complete address..." value={newPatient.address} onChange={e => setNewPatient({...newPatient, address: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Blood Group</label>
                  <input type="text" className="edit-input" placeholder="A+" value={newPatient.bloodGroup} onChange={e => setNewPatient({...newPatient, bloodGroup: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Gender</label>
                  <input type="text" className="edit-input" placeholder="Male/Female" value={newPatient.gender} onChange={e => setNewPatient({...newPatient, gender: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Date of Birth</label>
                  <input type="date" className="edit-input" value={newPatient.dob} onChange={e => setNewPatient({...newPatient, dob: e.target.value})} />
                </div>
              </div>
              <div className="form-footer">
                <button className="btn-primary" onClick={handleAddPatient}>Register Patient</button>
              </div>
            </section>
          </div>
        ) : data ? (
          <>
            <div className="dashboard-header">
              <h2>Dashboard Overview</h2>
              <p>Showing information for Patient: <strong>{data.patient.name} ({data.patient.id})</strong></p>
            </div>

            <div className="content-grid">
              <section className="card">
                <div className="card-header">
                  <h3>Patient Details</h3>
                  {!isEditing ? (
                    <button className="edit-link-btn" onClick={() => setIsEditing(true)}>Edit Info</button>
                  ) : (
                    <div className="edit-actions">
                      <button className="btn-small save" onClick={handleSavePatient}>Save</button>
                      <button className="btn-small cancel" onClick={() => setIsEditing(false)}>Cancel</button>
                    </div>
                  )}
                </div>
                
                <div className="info-body">
                  <div className="info-row">
                    <div className="info-label">Full Name</div>
                    {isEditing ? (
                      <input className="edit-input" value={editPatient?.name} onChange={e => setEditPatient({...editPatient!, name: e.target.value})} />
                    ) : (
                      <div className="info-value">{data.patient.name}</div>
                    )}
                  </div>
                  
                  <div className="info-row">
                    <div className="info-label">Identity ID</div>
                    <div className="info-value">{data.patient.id}</div>
                  </div>

                  <div className="info-row">
                    <div className="info-label">Email Address</div>
                    {isEditing ? (
                      <input className="edit-input" value={editPatient?.email} onChange={e => setEditPatient({...editPatient!, email: e.target.value})} />
                    ) : (
                      <div className="info-value">{data.patient.email}</div>
                    )}
                  </div>

                  <div className="info-row">
                    <div className="info-label">Contact Number</div>
                    {isEditing ? (
                      <input className="edit-input" value={editPatient?.phone} onChange={e => setEditPatient({...editPatient!, phone: e.target.value})} />
                    ) : (
                      <div className="info-value">{data.patient.phone}</div>
                    )}
                  </div>

                  <div className="info-row">
                    <div className="info-label">Residential Address</div>
                    {isEditing ? (
                      <textarea className="edit-input" value={editPatient?.address} onChange={e => setEditPatient({...editPatient!, address: e.target.value})} />
                    ) : (
                      <div className="info-value">{data.patient.address}</div>
                    )}
                  </div>

                  <div className="info-row">
                    <div className="info-label">Blood Type</div>
                    {isEditing ? (
                      <input className="edit-input" value={editPatient?.bloodGroup} onChange={e => setEditPatient({...editPatient!, bloodGroup: e.target.value})} />
                    ) : (
                      <div className="info-value">{data.patient.bloodGroup}</div>
                    )}
                  </div>
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
                  
                  <button className="btn-primary" onClick={generatePDF}>Generate Detailed Invoice PDF</button>
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
