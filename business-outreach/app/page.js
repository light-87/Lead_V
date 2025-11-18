'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Search, Mail, Settings, History, Target, Edit, Save, X, Globe, Plus, CheckSquare, Send, Trash2 } from 'lucide-react';
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
  const [emailStyle, setEmailStyle] = useState('nosite');
  const [settings, setSettings] = useState(null);
  const [history, setHistory] = useState([]);
  const [leads, setLeads] = useState([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedBusinessIds, setSelectedBusinessIds] = useState([]);
  const [bulkGenerating, setBulkGenerating] = useState(false);
  const [bulkSending, setBulkSending] = useState(false);
  const [generatedEmails, setGeneratedEmails] = useState([]);
  const [searchedCities, setSearchedCities] = useState([]);

  // Load settings on mount
  useEffect(() => {
    if (authenticated) {
      loadSettings();
      loadHistory();
      loadLeads();
    }
  }, [authenticated]);

  // Extract unique searched cities from history
  useEffect(() => {
    const cities = [...new Set(history.map(h => h.city))].filter(Boolean);
    setSearchedCities(cities);
  }, [history]);

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

  // Delete search history
  const deleteSearchHistory = async (searchId) => {
    try {
      const res = await fetch(`/api/data?searchId=${searchId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        toast.success('Search history deleted');
        loadHistory(selectedCity); // Reload history
      } else {
        toast.error('Failed to delete search history');
      }
    } catch (error) {
      console.error('Failed to delete search history:', error);
      toast.error('Failed to delete search history');
    }
  };

  // Delete lead
  const deleteLead = async (businessId) => {
    try {
      const res = await fetch(`/api/leads?businessId=${businessId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        toast.success('Lead deleted');
        loadLeads(); // Reload leads
      } else {
        toast.error('Failed to delete lead');
      }
    } catch (error) {
      console.error('Failed to delete lead:', error);
      toast.error('Failed to delete lead');
    }
  };

  // Load previous search results for a city
  const loadCityResults = async (cityName) => {
    try {
      const res = await fetch(`/api/data?city=${cityName}`);
      const data = await res.json();
      if (res.ok && data.history.length > 0) {
        // Get all businesses from all searches for this city
        const allBusinesses = data.history.flatMap(h => h.businesses || []);
        setBusinesses(allBusinesses);
        setCity(cityName);
        toast.success(`Loaded ${allBusinesses.length} businesses from ${cityName}`);
      }
    } catch (error) {
      toast.error('Failed to load city results');
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

  // Send email via Smartlead
  const sendViaSmartlead = async (business, emailData) => {
    try {
      // Use hardcoded campaign ID as fallback
      const campaignId = settings?.smartlead?.campaignId || '2690291';

      if (!campaignId) {
        toast.error('Campaign ID not configured. Please add it in Settings.');
        return;
      }

      if (!business.email) {
        toast.error('Business email is missing. Cannot send via Smartlead.');
        return;
      }

      setLoading(true);

      // Prepare lead data
      const leadData = {
        first_name: business.name?.split(' ')[0] || 'There',
        last_name: business.name?.split(' ').slice(1).join(' ') || '',
        name: business.name,
        email: business.email,
        company_name: business.name,
        website: business.website || '',
        location: business.address || '',
        address: business.address || '',
        phone: business.phone || '',
        business_type: business.business_type || '',
        id: business.id
      };

      // Send to Smartlead
      const res = await fetch('/api/smartlead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send',
          campaignId: campaignId,
          lead: leadData,
          email: emailData
        })
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(`Email sent to ${business.email} via Smartlead!`);

        // Also mark as sent in Lead Tracker
        await markEmailSent(business, emailData);
      } else {
        // Show detailed error message for 403 errors
        if (res.status === 403) {
          toast.error(data.message || data.error, {
            duration: 8000,
            icon: '⚠️',
          });
          if (data.solution) {
            console.log('Solution:', data.solution);
          }
        } else {
          toast.error(data.error || 'Failed to send via Smartlead');
        }
        console.error('Smartlead error:', data);
      }
    } catch (error) {
      toast.error('Failed to send via Smartlead');
      console.error('Smartlead send error:', error);
    } finally {
      setLoading(false);
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

  // Toggle business selection
  const toggleBusinessSelection = (businessId) => {
    setSelectedBusinessIds(prev =>
      prev.includes(businessId)
        ? prev.filter(id => id !== businessId)
        : [...prev, businessId]
    );
  };

  // Select all businesses
  const selectAllBusinesses = () => {
    if (selectedBusinessIds.length === businesses.length) {
      setSelectedBusinessIds([]);
    } else {
      setSelectedBusinessIds(businesses.map(b => b.id));
    }
  };

  // Generate emails for selected businesses
  const generateBulkEmails = async () => {
    if (selectedBusinessIds.length === 0) {
      toast.error('Please select at least one business');
      return;
    }

    setBulkGenerating(true);
    const emails = [];
    const selectedBusinesses = businesses.filter(b => selectedBusinessIds.includes(b.id));

    const loadingToast = toast.loading(`Generating emails for ${selectedBusinesses.length} businesses...`);

    for (let i = 0; i < selectedBusinesses.length; i++) {
      const business = selectedBusinesses[i];
      try {
        const currentSettings = settings || { emailStyles: DEFAULT_PROMPTS.emailStyles };

        // If using nosite styles, distribute across all three parts
        let currentStyle = emailStyle;
        if (emailStyle === 'nosite' || emailStyle === 'nosite_part2' || emailStyle === 'nosite_part3') {
          // Distribute emails evenly across all three nosite styles
          // All businesses now get a chance at the free preview offer (part 3)
          const nositeStyles = ['nosite', 'nosite_part2', 'nosite_part3'];
          const styleIndex = i % nositeStyles.length;
          currentStyle = nositeStyles[styleIndex];
        }

        const stylePrompt = currentSettings.emailStyles[currentStyle]?.prompt || DEFAULT_PROMPTS.emailStyles.professional.prompt;

        const notes = businessNotes[business.id] || '';
        const additionalNotes = notes ? `\nADDITIONAL NOTES ABOUT THIS BUSINESS:\n${notes}` : '';

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
          emails.push({
            business,
            email: data.email
          });
          toast.loading(`Generated ${i + 1}/${selectedBusinesses.length}...`, { id: loadingToast });
        }
      } catch (error) {
        console.error(`Failed to generate email for ${business.name}:`, error);
      }
    }

    setGeneratedEmails(emails);
    setBulkGenerating(false);
    toast.dismiss(loadingToast);
    toast.success(`Generated ${emails.length} emails!`);
    setSelectedBusinessIds([]);
  };

  // Send all generated emails via Smartlead
  const sendBulkEmails = async () => {
    if (generatedEmails.length === 0) {
      toast.error('No emails to send');
      return;
    }

    // Check if Smartlead is configured
    const campaignId = settings?.smartlead?.campaignId || '2690291';
    if (!campaignId) {
      toast.error('Campaign ID not configured. Please add it in Settings.');
      return;
    }

    setBulkSending(true);
    let successCount = 0;
    let failureCount = 0;

    const loadingToast = toast.loading(`Sending ${generatedEmails.length} emails via Smartlead...`);

    for (let i = 0; i < generatedEmails.length; i++) {
      const { business, email } = generatedEmails[i];

      try {
        if (!business.email) {
          console.warn(`Skipping ${business.name} - no email address`);
          failureCount++;
          continue;
        }

        // Prepare lead data
        const leadData = {
          first_name: business.name?.split(' ')[0] || 'There',
          last_name: business.name?.split(' ').slice(1).join(' ') || '',
          name: business.name,
          email: business.email,
          company_name: business.name,
          website: business.website || '',
          location: business.address || '',
          address: business.address || '',
          phone: business.phone || '',
          business_type: business.business_type || '',
          id: business.id
        };

        // Send to Smartlead
        const res = await fetch('/api/smartlead', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'send',
            campaignId: campaignId,
            lead: leadData,
            email: email
          })
        });

        const data = await res.json();

        if (res.ok) {
          successCount++;
          // Mark as sent in Lead Tracker
          await markEmailSent(business, email);
          toast.loading(`Sent ${successCount}/${generatedEmails.length}...`, { id: loadingToast });
        } else {
          failureCount++;
          console.error(`Failed to send to ${business.name}:`, data.error);
        }
      } catch (error) {
        failureCount++;
        console.error(`Error sending to ${business.name}:`, error);
      }
    }

    setBulkSending(false);
    toast.dismiss(loadingToast);

    if (successCount > 0 && failureCount === 0) {
      toast.success(`Successfully sent all ${successCount} emails via Smartlead!`);
      setGeneratedEmails([]); // Clear sent emails
    } else if (successCount > 0) {
      toast.success(`Sent ${successCount} emails. ${failureCount} failed.`);
    } else {
      toast.error(`Failed to send emails. Please check console for details.`);
    }
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Search Form */}
            <Card className="p-6">
              <h3 className="text-lg font-serif mb-4">New Search</h3>
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

            {/* Previously Searched Cities */}
            <Card className="p-6">
              <h3 className="text-lg font-serif mb-4">Previously Searched Cities</h3>
              {searchedCities.length === 0 ? (
                <p className="text-sm text-claude-gray text-center py-8">No previous searches yet</p>
              ) : (
                <div className="space-y-2">
                  {searchedCities.map((cityName, idx) => (
                    <Button
                      key={idx}
                      variant="outline"
                      className="w-full justify-start text-left hover:bg-claude-cream"
                      onClick={() => loadCityResults(cityName)}
                    >
                      <History className="w-4 h-4 mr-2" />
                      {cityName}
                    </Button>
                  ))}
                </div>
              )}
            </Card>
          </div>
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

              {/* Bulk Operations */}
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Button
                      onClick={selectAllBusinesses}
                      variant="outline"
                      size="sm"
                    >
                      <CheckSquare className="w-4 h-4 mr-2" />
                      {selectedBusinessIds.length === businesses.length ? 'Deselect All' : 'Select All'}
                    </Button>
                    {selectedBusinessIds.length > 0 && (
                      <span className="text-sm text-claude-gray">
                        {selectedBusinessIds.length} selected
                      </span>
                    )}
                  </div>
                  {selectedBusinessIds.length > 0 && (
                    <Button
                      onClick={generateBulkEmails}
                      disabled={bulkGenerating}
                      className="bg-claude-orange hover:bg-claude-orange-dark"
                    >
                      {bulkGenerating ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating...</>
                      ) : (
                        <><Mail className="w-4 h-4 mr-2" />Generate Emails ({selectedBusinessIds.length})</>
                      )}
                    </Button>
                  )}
                </div>
              </Card>

              {/* Email Style Selector */}
              <Card className="p-4">
                <label className="block text-sm font-medium mb-2">Email Style</label>
                <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
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
                  const isSelected = selectedBusinessIds.includes(business.id);

                  return (
                    <Card key={business.id} className={`overflow-hidden hover:shadow-lg transition ${isSelected ? 'ring-2 ring-claude-orange' : ''}`}>
                      <div className="relative bg-gradient-to-br from-claude-orange to-claude-orange-dark h-48 flex items-center justify-center">
                        <div className="text-center text-white">
                          <Globe className="w-16 h-16 mx-auto mb-2 opacity-50" />
                          <p className="text-sm font-medium">No Website</p>
                          <p className="text-xs opacity-75">Perfect opportunity!</p>
                        </div>
                        <div className="absolute top-2 left-2">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleBusinessSelection(business.id)}
                            className="bg-white border-2"
                          />
                        </div>
                      </div>
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
                          <p>🌐 No website (great opportunity!)</p>
                          {displayBusiness.email && <p>✉️ {displayBusiness.email}</p>}
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
                        onClick={() => sendViaSmartlead(selectedBusiness, email)}
                        disabled={loading}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        <Send className="w-4 h-4 mr-2" />
                        {loading ? 'Sending...' : 'Send via Smartlead'}
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

              {/* Bulk Generated Emails */}
              {generatedEmails.length > 0 && (
                <Card className="p-6 mt-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-serif">Generated Emails ({generatedEmails.length})</h3>
                    <Button
                      onClick={() => setGeneratedEmails([])}
                      variant="outline"
                      size="sm"
                    >
                      Clear All
                    </Button>
                  </div>

                  <div className="space-y-4 max-h-[600px] overflow-y-auto">
                    {generatedEmails.map(({ business, email }, idx) => (
                      <Card key={idx} className="p-4 border-2">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-serif font-semibold">{business.name}</h4>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                navigator.clipboard.writeText(`Subject: ${email.subject_line}\n\n${email.email_body}`);
                                toast.success(`Email for ${business.name} copied!`);
                              }}
                            >
                              Copy
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => sendViaSmartlead(business, email)}
                              disabled={loading}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Send className="w-4 h-4 mr-1" />
                              Send
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => markEmailSent(business, email)}
                              className="bg-claude-orange hover:bg-claude-orange-dark"
                            >
                              Mark Sent
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div>
                            <span className="text-xs font-medium text-claude-gray">Subject:</span>
                            <p className="text-sm">{email.subject_line}</p>
                          </div>
                          <div>
                            <span className="text-xs font-medium text-claude-gray">Body:</span>
                            <p className="text-sm whitespace-pre-wrap">{email.email_body}</p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>

                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded">
                    <p className="text-sm text-green-800 mb-2">
                      <strong>Ready to send?</strong> Send all {generatedEmails.length} emails via Smartlead.
                    </p>
                    <Button
                      onClick={sendBulkEmails}
                      disabled={bulkSending}
                      className="bg-green-600 hover:bg-green-700"
                      size="sm"
                    >
                      {bulkSending ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Sending...</>
                      ) : (
                        <><Send className="w-4 h-4 mr-2" />Send All via Smartlead ({generatedEmails.length})</>
                      )}
                    </Button>
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
            onDeleteLead={deleteLead}
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
            onDeleteHistory={deleteSearchHistory}
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
  const [email, setEmail] = useState(edits.email || business.email || '');
  const [businessNotes, setBusinessNotes] = useState(notes || '');

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Phone</label>
        <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
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
          onClick={() => onSave({ phone, email }, businessNotes)}
          className="flex-1 bg-claude-orange hover:bg-claude-orange-dark"
        >
          <Save className="w-4 h-4 mr-2" />Save Changes
        </Button>
      </div>
    </div>
  );
}

// Lead Tracker Tab Component
function LeadTrackerTab({ leads, onUpdateLead, onDeleteLead, emailStyles }) {
  const [followUpModal, setFollowUpModal] = useState(null);
  const [followUpEmail, setFollowUpEmail] = useState(null);
  const [generatingFollowUp, setGeneratingFollowUp] = useState(false);

  if (leads.length === 0) {
    return (
      <Card className="p-12 text-center">
        <Target className="w-12 h-12 mx-auto text-claude-gray mb-4" />
        <p className="text-claude-gray">No leads tracked yet. Send some emails and mark them as sent!</p>
      </Card>
    );
  }

  // Group leads by businessId to avoid duplicates
  const uniqueLeads = leads.reduce((acc, lead) => {
    const existing = acc.find(l => l.businessId === lead.businessId);
    if (!existing) {
      acc.push(lead);
    } else {
      // Keep the most recent version
      if (new Date(lead.updatedAt || lead.sentAt) > new Date(existing.updatedAt || existing.sentAt)) {
        const index = acc.indexOf(existing);
        acc[index] = lead;
      }
    }
    return acc;
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-serif">Lead Tracker</h2>
        <span className="text-sm text-claude-gray">{uniqueLeads.length} {uniqueLeads.length === 1 ? 'lead' : 'leads'} tracked</span>
      </div>
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
            {uniqueLeads.map((lead, idx) => {
              const daysSince = Math.floor((Date.now() - new Date(lead.sentAt).getTime()) / (1000 * 60 * 60 * 24));
              const respondedDate = lead.respondedAt ? new Date(lead.respondedAt).toLocaleDateString() : null;
              const meetingDate = lead.meetingScheduledAt ? new Date(lead.meetingScheduledAt).toLocaleDateString() : null;

              return (
                <tr key={lead.businessId || idx} className="border-b border-claude-border hover:bg-claude-cream">
                  <td className="p-3">{lead.businessName}</td>
                  <td className="p-3">{lead.city}</td>
                  <td className="p-3"><span className="text-xs bg-blue-100 px-2 py-1 rounded">{lead.emailStyle}</span></td>
                  <td className="p-3 text-sm">{new Date(lead.sentAt).toLocaleDateString()}</td>
                  <td className="p-3">{daysSince}d</td>
                  <td className="p-3">
                    <div className="flex flex-col gap-1 text-xs">
                      {lead.responded && (
                        <span className="text-green-600">✓ Responded {respondedDate && `(${respondedDate})`}</span>
                      )}
                      {lead.meetingScheduled && (
                        <span className="text-blue-600">✓ Meeting {meetingDate && `(${meetingDate})`}</span>
                      )}
                      {!lead.responded && !lead.meetingScheduled && <span className="text-gray-400">Pending</span>}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-2">
                      <div className="flex gap-1">
                        {!lead.responded && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onUpdateLead({
                              ...lead,
                              responded: true,
                              respondedAt: new Date().toISOString()
                            })}
                          >
                            Got Response
                          </Button>
                        )}
                        {!lead.meetingScheduled && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onUpdateLead({
                              ...lead,
                              meetingScheduled: true,
                              meetingScheduledAt: new Date().toISOString()
                            })}
                          >
                            Meeting
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setFollowUpModal(lead)}
                          className="bg-yellow-50 hover:bg-yellow-100"
                        >
                          <Mail className="w-3 h-3 mr-1" />
                          Follow-up
                        </Button>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to delete the lead for ${lead.businessName}? This will remove the entire row.`)) {
                            onDeleteLead(lead.businessId);
                          }
                        }}
                        className="bg-red-50 text-red-600 hover:text-red-700 hover:bg-red-100 border-red-200"
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Follow-up Email Modal */}
      {followUpModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <Card className="p-6 max-w-2xl w-full my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-serif">Send Follow-up Email</h3>
              <Button
                variant="ghost"
                onClick={() => {
                  setFollowUpModal(null);
                  setFollowUpEmail(null);
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-claude-gray">
                Send a follow-up email to <strong>{followUpModal.businessName}</strong>
              </p>

              {!followUpEmail ? (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-3">Select Email Style</label>
                    <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                      {Object.entries(emailStyles).map(([key, style]) => (
                        <Button
                          key={key}
                          variant="outline"
                          className="w-full text-left h-auto py-3 px-4 flex flex-col items-start hover:bg-blue-50"
                          disabled={generatingFollowUp}
                          onClick={async () => {
                            setGeneratingFollowUp(true);
                            try {
                              // Generate follow-up email using the same email generation API
                              const prompt = fillPrompt(style.prompt, {
                                name: followUpModal.businessName,
                                business_type: followUpModal.businessType || 'business',
                                address: followUpModal.city,
                                website: followUpModal.website || 'N/A',
                                phone: followUpModal.phone || 'N/A',
                                email: followUpModal.email || 'N/A',
                                description: followUpModal.description || '',
                                screenshot_url: followUpModal.screenshot || '',
                                additionalNotes: `This is a follow-up email. Previous email was sent on ${new Date(followUpModal.sentAt).toLocaleDateString()} using ${followUpModal.emailStyle} style.`
                              });

                              const res = await fetch('/api/generate-email', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ prompt })
                              });

                              const data = await res.json();
                              if (res.ok && data.email) {
                                setFollowUpEmail({
                                  ...data.email,
                                  style: style.name
                                });
                                toast.success('Follow-up email generated!');
                              } else {
                                toast.error('Failed to generate follow-up email');
                              }
                            } catch (error) {
                              console.error('Follow-up generation error:', error);
                              toast.error('Error generating follow-up email');
                            } finally {
                              setGeneratingFollowUp(false);
                            }
                          }}
                        >
                          <span className="font-medium text-base">{style.name}</span>
                          <span className="text-xs text-claude-gray mt-1">{style.description}</span>
                        </Button>
                      ))}
                    </div>
                  </div>

                  {generatingFollowUp && (
                    <div className="text-center py-4">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-claude-orange" />
                      <p className="text-sm text-claude-gray mt-2">Generating follow-up email...</p>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="mb-3">
                      <label className="text-xs font-medium text-claude-gray">Email Style</label>
                      <p className="text-sm font-medium">{followUpEmail.style}</p>
                    </div>
                    <div className="mb-3">
                      <label className="text-xs font-medium text-claude-gray">Subject</label>
                      <p className="text-sm">{followUpEmail.subject_line}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-claude-gray">Email Body</label>
                      <div className="text-sm whitespace-pre-wrap mt-1 max-h-64 overflow-y-auto bg-white p-3 rounded">
                        {followUpEmail.email_body}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setFollowUpEmail(null)}
                      className="flex-1"
                    >
                      Change Style
                    </Button>
                    <Button
                      onClick={() => {
                        // TODO: Implement actual email sending API
                        toast.success(`Follow-up email will be sent to ${followUpModal.businessName} (API coming soon)`);
                        setFollowUpModal(null);
                        setFollowUpEmail(null);
                      }}
                      className="flex-1 bg-claude-orange hover:bg-claude-orange-dark"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Send Email
                    </Button>
                  </div>

                  <p className="text-xs text-claude-gray">
                    Note: The follow-up will be tracked in the lead history once the email sending API is implemented.
                  </p>
                </>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

// History Tab Component
function HistoryTab({ history, onCityFilter, selectedCity, onDeleteHistory }) {
  const [expandedSearch, setExpandedSearch] = useState(null);
  const cities = [...new Set(history.map(h => h.city))].filter(Boolean);

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
          {history.map((search, idx) => {
            const isExpanded = expandedSearch === idx;
            const businesses = search.businesses || [];
            const displayBusinesses = isExpanded ? businesses : businesses.slice(0, 8);

            return (
              <Card key={idx} className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-serif text-lg">{search.city}</h3>
                    <p className="text-sm text-claude-gray">
                      {new Date(search.timestamp).toLocaleString()} • {businesses.length} businesses
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {businesses.length > 8 && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setExpandedSearch(isExpanded ? null : idx)}
                      >
                        {isExpanded ? 'Show Less' : `Show All ${businesses.length}`}
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        if (window.confirm(`Delete this search from ${search.city}?`)) {
                          onDeleteHistory(search.searchId);
                        }
                      }}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                  {displayBusinesses.map((b, i) => (
                    <div
                      key={i}
                      className="text-xs p-2 bg-claude-cream rounded hover:bg-claude-orange hover:text-white cursor-pointer transition"
                      title={`${b.name} - ${b.address}`}
                    >
                      {b.name}
                    </div>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Settings Tab Component
function SettingsTab({ settings, onSaveSettings }) {
  const [editedSettings, setEditedSettings] = useState(settings);
  const [editingPrompt, setEditingPrompt] = useState(null);
  const [editingSearchPrompt, setEditingSearchPrompt] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);

  // Initialize search prompt if not exists
  if (!editedSettings.searchPrompt) {
    editedSettings.searchPrompt = DEFAULT_PROMPTS.businessSearch;
  }

  // Test Smartlead connection
  const testSmartleadConnection = async () => {
    setTestingConnection(true);
    try {
      const res = await fetch('/api/smartlead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'test' })
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('Successfully connected to Smartlead API!');
        if (data.campaigns) {
          console.log('Available campaigns:', data.campaigns);
        }
      } else {
        // Show detailed error message for 403 errors
        if (res.status === 403) {
          toast.error(data.message || data.error, {
            duration: 8000,
            icon: '⚠️',
          });
          if (data.solution) {
            console.log('Solution:', data.solution);
            setTimeout(() => {
              toast(data.solution, {
                duration: 10000,
                icon: '💡',
                style: {
                  background: '#fff3cd',
                  color: '#856404',
                  border: '1px solid #ffeaa7',
                }
              });
            }, 500);
          }
        } else {
          toast.error(data.error || 'Failed to connect to Smartlead');
        }
        console.error('Connection error:', data);
      }
    } catch (error) {
      toast.error('Network error testing Smartlead connection');
      console.error('Test error:', error);
    } finally {
      setTestingConnection(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-serif">Settings</h2>

      {/* Search Prompt */}
      <Card className="p-6">
        <h3 className="text-lg font-serif mb-4">Business Search Prompt</h3>
        <p className="text-sm text-claude-gray mb-4">Customize the prompt used to search for businesses</p>

        <div className="border border-claude-border rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <div>
              <h4 className="font-medium">Search Prompt Template</h4>
              <p className="text-xs text-claude-gray">Used when searching for new businesses in a city</p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setEditingSearchPrompt(!editingSearchPrompt)}
            >
              <Edit className="w-3 h-3 mr-2" />
              {editingSearchPrompt ? 'Cancel' : 'Edit Prompt'}
            </Button>
          </div>
          {editingSearchPrompt && (
            <div className="mt-4">
              <Textarea
                value={editedSettings.searchPrompt}
                onChange={(e) => {
                  setEditedSettings({
                    ...editedSettings,
                    searchPrompt: e.target.value
                  });
                }}
                rows={15}
                className="font-mono text-xs mb-2"
              />
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setEditingSearchPrompt(false)}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="bg-claude-orange hover:bg-claude-orange-dark"
                  onClick={() => {
                    onSaveSettings(editedSettings);
                    setEditingSearchPrompt(false);
                  }}
                >
                  Save
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Smartlead Integration */}
      <Card className="p-6">
        <h3 className="text-lg font-serif mb-4">Smartlead Integration</h3>
        <p className="text-sm text-claude-gray mb-4">Configure Smartlead for automated email sending</p>

        {/* Plan Requirements Banner */}
        <div className="mb-4 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-blue-800">PRO Plan Required</h4>
              <div className="mt-2 text-sm text-blue-700">
                <p className="mb-2">Smartlead API access requires a PRO plan subscription.</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Go to Smartlead → Settings → Activate API</li>
                  <li>If "Activate API" is not available, upgrade to PRO plan</li>
                  <li>Your API key will be provided after activation</li>
                  <li>Add the API key to your .env.local file as SMARTLEAD_API_KEY</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Campaign ID</label>
            <input
              type="text"
              value={editedSettings.smartlead?.campaignId || '2690291'}
              onChange={(e) => {
                setEditedSettings({
                  ...editedSettings,
                  smartlead: {
                    ...editedSettings.smartlead,
                    campaignId: e.target.value
                  }
                });
              }}
              placeholder="2690291"
              className="w-full px-3 py-2 border border-claude-border rounded-md"
            />
            <p className="text-xs text-green-600 mt-1">✅ Pre-configured with Campaign ID: 2690291</p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={editedSettings.smartlead?.enabled ?? true}
              onChange={(e) => {
                setEditedSettings({
                  ...editedSettings,
                  smartlead: {
                    ...editedSettings.smartlead,
                    enabled: e.target.checked
                  }
                });
              }}
              className="rounded border-claude-border"
            />
            <label className="text-sm">Enable Smartlead integration (Enabled by default)</label>
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={testSmartleadConnection}
              disabled={testingConnection}
            >
              {testingConnection ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                'Test Connection'
              )}
            </Button>
            <Button
              size="sm"
              className="bg-claude-orange hover:bg-claude-orange-dark"
              onClick={() => {
                onSaveSettings(editedSettings);
              }}
            >
              Save Smartlead Settings
            </Button>
          </div>
        </div>
      </Card>

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
                  onClick={() => setEditingPrompt(editingPrompt === key ? null : key)}
                >
                  <Edit className="w-3 h-3 mr-2" />
                  {editingPrompt === key ? 'Cancel' : 'Edit Prompt'}
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
                    rows={15}
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
