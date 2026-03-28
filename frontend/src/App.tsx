import React, { useState, useEffect } from 'react'
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
  const [isEditing, setIsEditing] = useState(false)
  const [editPatient, setEditPatient] = useState<Patient | null>(null)
  const [isCopied, setIsCopied] = useState(false)
  
  const [isAdding, setIsAdding] = useState(false)
  const [newPatient, setNewPatient] = useState<Patient>({
    id: '', name: '', email: '', phone: '', address: '', bloodGroup: '', gender: '', dob: ''
  })
  const [newBilling, setNewBilling] = useState({
    amount: 0, status: 'PENDING', dueDate: new Date().toISOString().split('T')[0]
  })
  const [isBillingEditing, setIsBillingEditing] = useState(false)
  const [isAddingNewBill, setIsAddingNewBill] = useState(false)
  const [editBillingRecords, setEditBillingRecords] = useState<BillingRecord[]>([])

  const fetchPatientData = async () => {
    if (!patientId) return
    setLoading(true)
    setError('')
    setData(null)
    setIsEditing(false)
    setIsAdding(false)
    setIsAddingNewBill(false)

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
      setLoading(true)
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
      
      // If billing info provided, add it
      if (newBilling.amount > 0) {
        await fetch(`http://localhost:8082/api/billing`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            patientId: saved.id,
            amount: newBilling.amount,
            status: newBilling.status,
            dueDate: newBilling.dueDate
          })
        })
      }

      alert(`Patient ${saved.name} registered successfully!`)
      setPatientId(saved.id)
      setIsAdding(false)
      setNewPatient({ id: '', name: '', email: '', phone: '', address: '', bloodGroup: '', gender: '', dob: '' })
      setNewBilling({ amount: 0, status: 'PENDING', dueDate: new Date().toISOString().split('T')[0] })
      fetchPatientData()
    } catch (err: any) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAddBill = async () => {
    if (!data) return
    try {
      setLoading(true)
      const response = await fetch(`http://localhost:8082/api/billing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: data.patient.id,
          amount: newBilling.amount,
          status: newBilling.status,
          dueDate: newBilling.dueDate
        })
      })
      if (!response.ok) throw new Error('Failed to add billing record')
      
      await fetchPatientData()
      setIsAddingNewBill(false)
      setNewBilling({ amount: 0, status: 'PENDING', dueDate: new Date().toISOString().split('T')[0] })
      alert('Billing record added successfully!')
    } catch (err: any) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveBilling = async () => {
    if (!data) return
    try {
      setLoading(true)
      const updatePromises = editBillingRecords.map(record => 
        fetch(`http://localhost:8082/api/billing/${record.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(record)
        })
      )
      
      const results = await Promise.all(updatePromises)
      const failed = results.filter(r => !r.ok)
      
      if (failed.length > 0) throw new Error('Some billing records failed to update')
      
      await fetchPatientData()
      setIsBillingEditing(false)
      alert('Billing records updated successfully!')
    } catch (err: any) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async () => {
    if (!data) return
    try {
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2))
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy data:', err)
      alert('Failed to copy data to clipboard')
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
            
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
              <section className="card add-form">
                <div className="card-header">
                  <h3>Clinical Profile</h3>
                </div>
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
              </section>

              <section className="card add-form">
                <div className="card-header">
                  <h3>Initial Billing (Optional)</h3>
                </div>
                <div className="grid-form" style={{ gridTemplateColumns: '1fr' }}>
                  <div className="form-group">
                    <label>Outstanding Amount ($)</label>
                    <input type="number" className="edit-input" placeholder="0.00" value={newBilling.amount} onChange={e => setNewBilling({...newBilling, amount: parseFloat(e.target.value) || 0})} />
                  </div>
                  <div className="form-group">
                    <label>Payment Status</label>
                    <select className="edit-input" value={newBilling.status} onChange={e => setNewBilling({...newBilling, status: e.target.value})}>
                      <option value="PENDING">PENDING</option>
                      <option value="PAID">PAID</option>
                      <option value="OVERDUE">OVERDUE</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Due Date</label>
                    <input type="date" className="edit-input" value={newBilling.dueDate} onChange={e => setNewBilling({...newBilling, dueDate: e.target.value})} />
                  </div>
                </div>
                <div className="form-footer" style={{ marginTop: 'auto', paddingTop: '2rem' }}>
                  <button className="btn-primary" style={{ width: '100%' }} onClick={handleAddPatient}>Complete Registration</button>
                </div>
              </section>
            </div>
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
                  {!isBillingEditing && !isAddingNewBill ? (
                    <div className="edit-actions">
                      <button className="edit-link-btn" onClick={() => setIsAddingNewBill(true)}>Add Bill</button>
                      <button className="edit-link-btn" onClick={() => {
                        setIsBillingEditing(true);
                        setEditBillingRecords([...data.billingRecords]);
                      }}>Edit Bills</button>
                    </div>
                  ) : isBillingEditing ? (
                    <div className="edit-actions">
                      <button className="btn-small save" onClick={handleSaveBilling}>Save All</button>
                      <button className="btn-small cancel" onClick={() => setIsBillingEditing(false)}>Cancel</button>
                    </div>
                  ) : (
                    <div className="edit-actions">
                      <button className="btn-small save" onClick={handleAddBill}>Create Bill</button>
                      <button className="btn-small cancel" onClick={() => setIsAddingNewBill(false)}>Cancel</button>
                    </div>
                  )}
                </div>

                {data.billingStatus === 'FALLBACK' && (
                  <div className="status-banner warning">
                    <span>⚠️</span>
                    Billing service unreachable - displaying last known status from cache.
                  </div>
                )}

                <div className="invoice-preview">
                  {isAddingNewBill && (
                    <div style={{ padding: '1rem', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-md)', marginBottom: '2rem', backgroundColor: 'var(--bg-subtle)' }}>
                      <div className="invoice-id">NEW INVOICE</div>
                      <div className="grid-form" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                        <div className="form-group">
                          <label>Amount ($)</label>
                          <input type="number" className="edit-input" value={newBilling.amount} onChange={e => setNewBilling({...newBilling, amount: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>Status</label>
                          <select className="edit-input" value={newBilling.status} onChange={e => setNewBilling({...newBilling, status: e.target.value})}>
                            <option value="PENDING">PENDING</option>
                            <option value="PAID">PAID</option>
                            <option value="OVERDUE">OVERDUE</option>
                          </select>
                        </div>
                        <div className="form-group" style={{ gridColumn: 'span 2' }}>
                          <label>Due Date</label>
                          <input type="date" className="edit-input" value={newBilling.dueDate} onChange={e => setNewBilling({...newBilling, dueDate: e.target.value})} />
                        </div>
                      </div>
                    </div>
                  )}

                  {(isBillingEditing ? editBillingRecords : data.billingRecords).length > 0 ? (
                    (isBillingEditing ? editBillingRecords : data.billingRecords).map((record, index) => (
                      <div key={record.id} style={{ marginBottom: index !== (isBillingEditing ? editBillingRecords : data.billingRecords).length - 1 ? '2rem' : '0' }}>
                        <div className="invoice-id">INVOICE ID</div>
                        <div className="invoice-meta">
                          <div className="info-value">#INV-2026-{String(record.id).padStart(5, '0')}</div>
                          <div className="info-label">DATE ISSUED: {record.dueDate}</div>
                        </div>

                        <div className="total-due">
                          <div>
                            <div className="info-label">Total Outstanding Amount</div>
                            {isBillingEditing ? (
                              <div style={{ display: 'flex', alignItems: 'center' }}>
                                <span style={{ marginRight: '4px' }}>$</span>
                                <input 
                                  type="number" 
                                  className="edit-input" 
                                  style={{ width: '120px' }}
                                  value={record.amount} 
                                  onChange={e => {
                                    const updated = [...editBillingRecords];
                                    updated[index] = { ...updated[index], amount: parseFloat(e.target.value) || 0 };
                                    setEditBillingRecords(updated);
                                  }} 
                                />
                              </div>
                            ) : (
                              <div className="amount">${record.amount.toLocaleString()}</div>
                            )}
                          </div>
                          
                          {isBillingEditing ? (
                            <select 
                              className="edit-input"
                              value={record.status}
                              onChange={e => {
                                const updated = [...editBillingRecords];
                                updated[index] = { ...updated[index], status: e.target.value };
                                setEditBillingRecords(updated);
                              }}
                            >
                              <option value="PAID">PAID</option>
                              <option value="PENDING">PENDING</option>
                              <option value="OVERDUE">OVERDUE</option>
                            </select>
                          ) : (
                            <div className={`status-pill status-${record.status}`}>
                              {record.status === 'PENDING' ? '● Pending Payment' : record.status}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>No billing records found.</p>
                  )}
                  
                  {!isBillingEditing && (
                    <button 
                      className={isCopied ? "btn-secondary" : "btn-primary"}
                      onClick={copyToClipboard}
                      style={{ 
                        width: '100%', 
                        padding: '0.875rem', 
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        transition: 'all 0.3s ease',
                        backgroundColor: isCopied ? '#10b981' : undefined,
                        borderColor: isCopied ? '#10b981' : undefined,
                        color: isCopied ? 'white' : undefined,
                        marginTop: '1.5rem'
                      }}
                    >
                      {isCopied ? (
                        <>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                          Data Copied to Clipboard!
                        </>
                      ) : (
                        <>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                          </svg>
                          Copy Patient Data (JSON)
                        </>
                      )}
                    </button>
                  )}
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
            <div className="empty-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 11H5M19 11C20.1046 11 21 11.8954 21 13V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V13C3 11.8954 3.89543 11 5 11M19 11V9C19 7.89543 18.1046 7 17 7M5 11V9C5 7.89543 5.89543 7 7 7M7 7V5C7 3.89543 7.89543 3 9 3H15C16.1046 3 17 3.89543 17 5V7M7 7H17"/>
              </svg>
            </div>
            <h3>Patient Dashboard Ready</h3>
            <p>Enter a Patient ID in the search bar above to securely access clinical profiles and financial reports.</p>
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
