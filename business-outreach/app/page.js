'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Search, Mail, Settings, History, Target, Edit, Save, X, Globe, Plus } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { DEFAULT_PROMPTS, fillPrompt } from '@/lib/prompts';

// UK Cities data for autocomplete
const UK_CITIES = [
  'London', 'Manchester', 'Birmingham', 'Leeds', 'Glasgow', 'Edinburgh',
  'Liverpool', 'Bristol', 'Cardiff', 'Sheffield', 'Newcastle', 'Nottingham',
  'Southampton', 'Leicester', 'Brighton', 'Oxford', 'Cambridge', 'York',
  'Bath', 'Norwich', 'Exeter', 'Plymouth', 'Canterbury', 'Durham'
];

export default function Home() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [city, setCity] = useState('');
  const [citySuggestions, setCitySuggestions] = useState([]);
  const [count, setCount] = useState(20);
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [email, setEmail] = useState(null);
  const [editingBusiness, setEditingBusiness] = useState(null);
  const [businessEdits, setBusinessEdits] = useState({});
  const [businessNotes, setBusinessNotes] = useState({});
  const [emailStyle, setEmailStyle] = useState('professional');
  const [settings, setSettings] = useState(null);
  const [history, setHistory] = useState([]);
  const [leads, setLeads] = useState([]);
  const [selectedCity, setSelectedCity] = useState('');

  // Load settings on mount
  useEffect(() => {
    if (authenticated) {
      loadSettings();
      loadHistory();
      loadLeads();
    }
  }, [authenticated]);

  // City autocomplete
  const handleCityChange = (value) => {
    setCity(value);
    if (value.length > 0) {
      const filtered = UK_CITIES.filter(c =>
        c.toLowerCase().includes(value.toLowerCase())
      );
      setCitySuggestions(filtered.slice(0, 5));
    } else {
      setCitySuggestions([]);
    }
  };

  // Load settings
  const loadSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (res.ok) {
        setSettings(data.settings);
        if (data.settings.emailStyle) {
          setEmailStyle(data.settings.emailStyle);
        }
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  // Save settings
  const saveSettings = async (newSettings) => {
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: newSettings })
      });
      if (res.ok) {
        setSettings(newSettings);
        toast.success('Settings saved!');
      }
    } catch (error) {
      toast.error('Failed to save settings');
    }
  };

  // Load history
  const loadHistory = async (cityFilter = null) => {
    try {
      const url = cityFilter ? `/api/data?city=${cityFilter}` : '/api/data';
      const res = await fetch(url);
      const data = await res.json();
      if (res.ok) {
        setHistory(data.history);
      }
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  };

  // Load leads
  const loadLeads = async () => {
    try {
      const res = await fetch('/api/leads');
      const data = await res.json();
      if (res.ok) {
        setLeads(data.leads);
      }
    } catch (error) {
      console.error('Failed to load leads:', error);
    }
  };

  // Auth check
  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Toaster position="top-center" />
        <Card className="p-8 w-96">
          <h2 className="text-2xl font-serif mb-4">Enter Password</h2>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && password === 'wecandothis') {
                setAuthenticated(true);
                toast.success('Welcome!');
              }
            }}
            placeholder="Password"
            className="mb-4"
          />
          <Button
            onClick={() => {
              if (password === 'wecandothis') {
                setAuthenticated(true);
                toast.success('Welcome!');
              } else {
                toast.error('Wrong password');
              }
            }}
            className="w-full bg-claude-orange hover:bg-claude-orange-dark"
          >
            Login
          </Button>
        </Card>
      </div>
    );
  }

  // Search businesses
  const searchBusinesses = async (excludeNames = []) => {
    setLoading(true);
    try {
      const searchId = `${city.toLowerCase()}-${Date.now()}`;

      // Build exclude text for prompt
      let excludeText = '';
      if (excludeNames.length > 0) {
        excludeText = `IMPORTANT: DO NOT include these businesses (we already have them): ${excludeNames.join(', ')}`;
      }

      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          city,
          count,
          excludeBusinesses: excludeText
        })
      });
      const data = await res.json();

      if (res.ok) {
        const newBusinesses = excludeNames.length > 0
          ? [...businesses, ...data.businesses]
          : data.businesses;

        setBusinesses(newBusinesses);

        // Save to blob storage
        await fetch('/api/data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            businesses: data.businesses,
            city,
            searchId
          })
        });

        toast.success(`Found ${data.businesses.length} businesses!`);
        loadHistory(); // Refresh history
      } else {
        toast.error(data.error || 'Search failed');
      }
    } catch (error) {
      toast.error('Search failed: ' + error.message);
    }
    setLoading(false);
  };

  // Search more businesses (ignoring existing)
  const searchMore = () => {
    const existingNames = businesses.map(b => b.name);
    searchBusinesses(existingNames);
  };

  // Generate email with selected style and notes
  const generateEmail = async (business) => {
    setSelectedBusiness(business);
    const loadingToast = toast.loading('Generating email...');

    try {
      const currentSettings = settings || { emailStyles: DEFAULT_PROMPTS.emailStyles };
      const stylePrompt = currentSettings.emailStyles[emailStyle]?.prompt || DEFAULT_PROMPTS.emailStyles.professional.prompt;

      // Add notes if available
      const notes = businessNotes[business.id] || '';
      const additionalNotes = notes ? `\nADDITIONAL NOTES ABOUT THIS BUSINESS:\n${notes}` : '';

      // Get business edits if any
      const edits = businessEdits[business.id] || {};
      const businessData = {
        ...business,
        ...edits,
        additionalNotes
      };

      const res = await fetch('/api/generate-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business: businessData,
          customPrompt: stylePrompt
        })
      });
      const data = await res.json();

      if (res.ok) {
        setEmail(data.email);
        toast.dismiss(loadingToast);
        toast.success('Email generated!');
      } else {
        toast.dismiss(loadingToast);
        toast.error(data.error || 'Generation failed');
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error('Generation failed: ' + error.message);
    }
  };

  // Mark email as sent and add to leads
  const markEmailSent = async (business, emailData) => {
    try {
      const leadData = {
        businessId: business.id,
        businessName: business.name,
        city: city,
        email: business.email,
        emailStyle: emailStyle,
        sentAt: new Date().toISOString(),
        status: 'sent',
        responded: false,
        meetingScheduled: false,
        daysSinceSent: 0,
        emailSubject: emailData.subject_line,
        emailBody: emailData.email_body,
        resendHistory: []
      };

      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadData })
      });

      if (res.ok) {
        toast.success('Marked as sent and added to Lead Tracker!');
        loadLeads();
      }
    } catch (error) {
      toast.error('Failed to save lead');
    }
  };

  // Update lead status
  const updateLead = async (leadData) => {
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadData })
      });

      if (res.ok) {
        toast.success('Lead updated!');
        loadLeads();
      }
    } catch (error) {
      toast.error('Failed to update lead');
    }
  };

  // Save business edits
  const saveBusinessEdit = async (businessId, edits) => {
    try {
      const res = await fetch('/api/business-edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId, edits })
      });

      if (res.ok) {
        setBusinessEdits(prev => ({ ...prev, [businessId]: edits }));
        setEditingBusiness(null);
        toast.success('Business updated!');
      }
    } catch (error) {
      toast.error('Failed to save edit');
    }
  };

  // Export to CSV
  const exportCSV = () => {
    const csv = [
      ['Name', 'Type', 'Address', 'Phone', 'Website', 'Email', 'Description'].join(','),
      ...businesses.map(b =>
        [b.name, b.business_type, b.address, b.phone, b.website, b.email, b.description].join(',')
      )
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `businesses_${city}_${Date.now()}.csv`;
    a.click();
    toast.success('CSV exported!');
  };

  return (
    <div className="min-h-screen p-6">
      <Toaster position="top-center" />

      <header className="mb-8">
        <h1 className="text-4xl font-serif text-claude-black">Local Business Outreach</h1>
        <p className="text-claude-gray mt-2">Find local businesses & generate personalized emails</p>
      </header>

      <Tabs defaultValue="search" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="search"><Search className="w-4 h-4 mr-2" />Search</TabsTrigger>
          <TabsTrigger value="results"><Mail className="w-4 h-4 mr-2" />Results ({businesses.length})</TabsTrigger>
          <TabsTrigger value="leads"><Target className="w-4 h-4 mr-2" />Lead Tracker ({leads.length})</TabsTrigger>
          <TabsTrigger value="history"><History className="w-4 h-4 mr-2" />History</TabsTrigger>
          <TabsTrigger value="settings"><Settings className="w-4 h-4 mr-2" />Settings</TabsTrigger>
        </TabsList>

        {/* SEARCH TAB */}
        <TabsContent value="search">
          <Card className="p-6 max-w-2xl">
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium">City (UK)</label>
                  <div className="flex items-center gap-2 text-xs text-claude-gray">
                    <Globe className="w-3 h-3" />
                    <span>More countries coming soon</span>
                  </div>
                </div>
                <div className="relative">
                  <Input
                    value={city}
                    onChange={(e) => handleCityChange(e.target.value)}
                    placeholder="e.g., London, Manchester, Birmingham"
                    autoComplete="off"
                  />
                  {citySuggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-claude-border rounded-lg shadow-lg">
                      {citySuggestions.map((suggestion, idx) => (
                        <div
                          key={idx}
                          className="px-4 py-2 hover:bg-claude-cream cursor-pointer"
                          onClick={() => {
                            setCity(suggestion);
                            setCitySuggestions([]);
                          }}
                        >
                          {suggestion}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Number of Businesses (20-50)</label>
                <Input
                  type="number"
                  min="20"
                  max="50"
                  value={count}
                  onChange={(e) => setCount(parseInt(e.target.value))}
                />
              </div>

              <Button
                onClick={() => searchBusinesses([])}
                disabled={loading || !city}
                className="w-full bg-claude-orange hover:bg-claude-orange-dark"
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Searching...</>
                ) : (
                  <><Search className="w-4 h-4 mr-2" />Search Businesses</>
                )}
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* RESULTS TAB */}
        <TabsContent value="results">
          {businesses.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-claude-gray">No results yet. Start a search!</p>
            </Card>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-serif">Found {businesses.length} businesses</h2>
                <div className="flex gap-2">
                  <Button onClick={searchMore} variant="outline" disabled={loading}>
                    <Plus className="w-4 h-4 mr-2" />
                    Search More
                  </Button>
                  <Button onClick={exportCSV} variant="outline">Export CSV</Button>
                </div>
              </div>

              {/* Email Style Selector */}
              <Card className="p-4">
                <label className="block text-sm font-medium mb-2">Email Style</label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  {Object.entries(DEFAULT_PROMPTS.emailStyles).map(([key, style]) => (
                    <Button
                      key={key}
                      variant={emailStyle === key ? 'default' : 'outline'}
                      onClick={() => setEmailStyle(key)}
                      size="sm"
                      className={emailStyle === key ? 'bg-claude-orange hover:bg-claude-orange-dark' : ''}
                    >
                      {style.name}
                    </Button>
                  ))}
                </div>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {businesses.map((business) => {
                  const edits = businessEdits[business.id] || {};
                  const displayBusiness = { ...business, ...edits };
                  const notes = businessNotes[business.id];

                  return (
                    <Card key={business.id} className="overflow-hidden hover:shadow-lg transition">
                      <img
                        src={business.screenshot_url}
                        alt={business.name}
                        className="w-full h-48 object-cover"
                        onError={(e) => e.target.src = 'https://via.placeholder.com/400x300?text=No+Screenshot'}
                      />
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-serif text-lg font-semibold">{displayBusiness.name}</h3>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setEditingBusiness(business)}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                        </div>
                        <p className="text-sm text-claude-gray mb-3">{displayBusiness.description}</p>
                        {notes && (
                          <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                            <strong>Notes:</strong> {notes}
                          </div>
                        )}
                        <div className="text-xs space-y-1 text-claude-gray mb-4">
                          <p>📍 {displayBusiness.address}</p>
                          <p>📞 {displayBusiness.phone}</p>
                          <p>
                            🌐{' '}
                            <a href={displayBusiness.website} target="_blank" rel="noopener noreferrer" className="text-claude-orange hover:underline">
                              {displayBusiness.website}
                            </a>
                          </p>
                          <p>✉️ {displayBusiness.email}</p>
                        </div>
                        <Button
                          onClick={() => generateEmail(displayBusiness)}
                          className="w-full bg-claude-orange hover:bg-claude-orange-dark"
                          size="sm"
                        >
                          <Mail className="w-3 h-3 mr-2" />Generate Email ({emailStyle})
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>

              {/* Business Edit Modal */}
              {editingBusiness && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                  <Card className="p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-serif">Edit Business: {editingBusiness.name}</h3>
                      <Button variant="ghost" onClick={() => setEditingBusiness(null)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    <EditBusinessForm
                      business={editingBusiness}
                      edits={businessEdits[editingBusiness.id] || {}}
                      notes={businessNotes[editingBusiness.id] || ''}
                      onSave={(edits, notes) => {
                        saveBusinessEdit(editingBusiness.id, edits);
                        setBusinessNotes(prev => ({ ...prev, [editingBusiness.id]: notes }));
                      }}
                      onCancel={() => setEditingBusiness(null)}
                    />
                  </Card>
                </div>
              )}

              {/* Email Preview */}
              {email && selectedBusiness && (
                <Card className="p-6 mt-6">
                  <h3 className="text-xl font-serif mb-4">Generated Email for {selectedBusiness.name}</h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Subject</label>
                      <Input value={email.subject_line} onChange={(e) => setEmail({ ...email, subject_line: e.target.value })} />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Email Body</label>
                      <Textarea
                        value={email.email_body}
                        onChange={(e) => setEmail({ ...email, email_body: e.target.value })}
                        rows={12}
                        className="font-mono text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Key Issues Identified</label>
                      <ul className="list-disc list-inside space-y-1">
                        {email.key_issues.map((issue, i) => (
                          <li key={i} className="text-sm text-claude-gray">{issue}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => {
                          navigator.clipboard.writeText(`Subject: ${email.subject_line}\n\n${email.email_body}`);
                          toast.success('Email copied to clipboard!');
                        }}
                        variant="outline"
                        className="flex-1"
                      >
                        Copy Email
                      </Button>
                      <Button
                        onClick={() => markEmailSent(selectedBusiness, email)}
                        className="flex-1 bg-claude-orange hover:bg-claude-orange-dark"
                      >
                        Mark as Sent & Track
                      </Button>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          )}
        </TabsContent>

        {/* LEAD TRACKER TAB */}
        <TabsContent value="leads">
          <LeadTrackerTab
            leads={leads}
            onUpdateLead={updateLead}
            emailStyles={DEFAULT_PROMPTS.emailStyles}
          />
        </TabsContent>

        {/* HISTORY TAB */}
        <TabsContent value="history">
          <HistoryTab
            history={history}
            onCityFilter={(city) => {
              setSelectedCity(city);
              loadHistory(city);
            }}
            selectedCity={selectedCity}
          />
        </TabsContent>

        {/* SETTINGS TAB */}
        <TabsContent value="settings">
          <SettingsTab
            settings={settings || { emailStyles: DEFAULT_PROMPTS.emailStyles }}
            onSaveSettings={saveSettings}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Edit Business Form Component
function EditBusinessForm({ business, edits, notes, onSave, onCancel }) {
  const [phone, setPhone] = useState(edits.phone || business.phone || '');
  const [website, setWebsite] = useState(edits.website || business.website || '');
  const [email, setEmail] = useState(edits.email || business.email || '');
  const [businessNotes, setBusinessNotes] = useState(notes || '');

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Phone</label>
        <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Website</label>
        <Input value={website} onChange={(e) => setWebsite(e.target.value)} />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Email</label>
        <Input value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">
          Notes (will be injected into email generation)
        </label>
        <Textarea
          value={businessNotes}
          onChange={(e) => setBusinessNotes(e.target.value)}
          rows={4}
          placeholder="e.g., They mentioned they're interested in e-commerce features..."
        />
      </div>
      <div className="flex gap-2">
        <Button onClick={onCancel} variant="outline" className="flex-1">Cancel</Button>
        <Button
          onClick={() => onSave({ phone, website, email }, businessNotes)}
          className="flex-1 bg-claude-orange hover:bg-claude-orange-dark"
        >
          <Save className="w-4 h-4 mr-2" />Save Changes
        </Button>
      </div>
    </div>
  );
}

// Lead Tracker Tab Component
function LeadTrackerTab({ leads, onUpdateLead, emailStyles }) {
  if (leads.length === 0) {
    return (
      <Card className="p-12 text-center">
        <Target className="w-12 h-12 mx-auto text-claude-gray mb-4" />
        <p className="text-claude-gray">No leads tracked yet. Send some emails and mark them as sent!</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-serif">Lead Tracker ({leads.length} leads)</h2>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-claude-border">
              <th className="text-left p-3 font-medium">Business</th>
              <th className="text-left p-3 font-medium">City</th>
              <th className="text-left p-3 font-medium">Email Style</th>
              <th className="text-left p-3 font-medium">Sent</th>
              <th className="text-left p-3 font-medium">Days</th>
              <th className="text-left p-3 font-medium">Status</th>
              <th className="text-left p-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead, idx) => {
              const daysSince = Math.floor((Date.now() - new Date(lead.sentAt).getTime()) / (1000 * 60 * 60 * 24));

              return (
                <tr key={idx} className="border-b border-claude-border hover:bg-claude-cream">
                  <td className="p-3">{lead.businessName}</td>
                  <td className="p-3">{lead.city}</td>
                  <td className="p-3"><span className="text-xs bg-blue-100 px-2 py-1 rounded">{lead.emailStyle}</span></td>
                  <td className="p-3 text-sm">{new Date(lead.sentAt).toLocaleDateString()}</td>
                  <td className="p-3">{daysSince}d</td>
                  <td className="p-3">
                    <div className="flex flex-col gap-1 text-xs">
                      {lead.responded && <span className="text-green-600">✓ Responded</span>}
                      {lead.meetingScheduled && <span className="text-blue-600">✓ Meeting</span>}
                      {!lead.responded && !lead.meetingScheduled && <span className="text-gray-400">Pending</span>}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-1">
                      {!lead.responded && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onUpdateLead({ ...lead, responded: true })}
                        >
                          Got Response
                        </Button>
                      )}
                      {!lead.meetingScheduled && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onUpdateLead({ ...lead, meetingScheduled: true })}
                        >
                          Meeting
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// History Tab Component
function HistoryTab({ history, onCityFilter, selectedCity }) {
  const cities = [...new Set(history.map(h => h.city))].filter(Boolean);
  const allBusinesses = history.flatMap(h => h.businesses || []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-serif">Search History</h2>
        <div className="flex gap-2 items-center">
          <span className="text-sm text-claude-gray">Filter by city:</span>
          <Button
            size="sm"
            variant={!selectedCity ? 'default' : 'outline'}
            onClick={() => onCityFilter(null)}
          >
            All
          </Button>
          {cities.map(city => (
            <Button
              key={city}
              size="sm"
              variant={selectedCity === city ? 'default' : 'outline'}
              onClick={() => onCityFilter(city)}
              className={selectedCity === city ? 'bg-claude-orange hover:bg-claude-orange-dark' : ''}
            >
              {city}
            </Button>
          ))}
        </div>
      </div>

      {history.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-claude-gray">No search history yet</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {history.map((search, idx) => (
            <Card key={idx} className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-serif text-lg">{search.city}</h3>
                  <p className="text-sm text-claude-gray">
                    {new Date(search.timestamp).toLocaleString()} • {search.businesses?.length || 0} businesses
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                {(search.businesses || []).slice(0, 8).map((b, i) => (
                  <div key={i} className="text-xs p-2 bg-claude-cream rounded">
                    {b.name}
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// Settings Tab Component
function SettingsTab({ settings, onSaveSettings }) {
  const [editedSettings, setEditedSettings] = useState(settings);
  const [editingPrompt, setEditingPrompt] = useState(null);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-serif">Settings</h2>

      {/* Email Styles */}
      <Card className="p-6">
        <h3 className="text-lg font-serif mb-4">Email Style Templates</h3>
        <p className="text-sm text-claude-gray mb-4">Customize prompts for different email styles</p>

        <div className="space-y-4">
          {Object.entries(editedSettings.emailStyles || {}).map(([key, style]) => (
            <div key={key} className="border border-claude-border rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <h4 className="font-medium">{style.name}</h4>
                  <p className="text-xs text-claude-gray">{style.description}</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setEditingPrompt(key)}
                >
                  <Edit className="w-3 h-3 mr-2" />Edit Prompt
                </Button>
              </div>
              {editingPrompt === key && (
                <div className="mt-4">
                  <Textarea
                    value={style.prompt}
                    onChange={(e) => {
                      setEditedSettings({
                        ...editedSettings,
                        emailStyles: {
                          ...editedSettings.emailStyles,
                          [key]: { ...style, prompt: e.target.value }
                        }
                      });
                    }}
                    rows={10}
                    className="font-mono text-xs mb-2"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setEditingPrompt(null)}>
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      className="bg-claude-orange hover:bg-claude-orange-dark"
                      onClick={() => {
                        onSaveSettings(editedSettings);
                        setEditingPrompt(null);
                      }}
                    >
                      Save
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Save All Settings */}
      <Button
        onClick={() => onSaveSettings(editedSettings)}
        className="bg-claude-orange hover:bg-claude-orange-dark"
      >
        <Save className="w-4 h-4 mr-2" />
        Save All Settings
      </Button>
    </div>
  );
}
