'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Search, Mail, Settings, History } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function Home() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [city, setCity] = useState('');
  const [count, setCount] = useState(20);
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [email, setEmail] = useState(null);

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
  const searchBusinesses = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ city, count })
      });
      const data = await res.json();

      if (res.ok) {
        setBusinesses(data.businesses);
        toast.success(`Found ${data.businesses.length} businesses!`);
      } else {
        toast.error(data.error || 'Search failed');
      }
    } catch (error) {
      toast.error('Search failed: ' + error.message);
    }
    setLoading(false);
  };

  // Generate email
  const generateEmail = async (business) => {
    setSelectedBusiness(business);
    const loadingToast = toast.loading('Generating email...');
    try {
      const res = await fetch('/api/generate-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ business })
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
          <TabsTrigger value="settings"><Settings className="w-4 h-4 mr-2" />Settings</TabsTrigger>
          <TabsTrigger value="history"><History className="w-4 h-4 mr-2" />History</TabsTrigger>
        </TabsList>

        {/* SEARCH TAB */}
        <TabsContent value="search">
          <Card className="p-6 max-w-2xl">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">City (UK)</label>
                <Input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g., London, Manchester, Birmingham"
                />
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
                onClick={searchBusinesses}
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
                <Button onClick={exportCSV} variant="outline">Export CSV</Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {businesses.map((business) => (
                  <Card key={business.id} className="overflow-hidden hover:shadow-lg transition">
                    <img
                      src={business.screenshot_url}
                      alt={business.name}
                      className="w-full h-48 object-cover"
                      onError={(e) => e.target.src = 'https://via.placeholder.com/400x300?text=No+Screenshot'}
                    />
                    <div className="p-4">
                      <h3 className="font-serif text-lg font-semibold mb-2">{business.name}</h3>
                      <p className="text-sm text-claude-gray mb-3">{business.description}</p>
                      <div className="text-xs space-y-1 text-claude-gray mb-4">
                        <p>📍 {business.address}</p>
                        <p>📞 {business.phone}</p>
                        <p>
                          🌐{' '}
                          <a href={business.website} target="_blank" rel="noopener noreferrer" className="text-claude-orange hover:underline">
                            {business.website}
                          </a>
                        </p>
                        <p>✉️ {business.email}</p>
                      </div>
                      <Button
                        onClick={() => generateEmail(business)}
                        className="w-full bg-claude-orange hover:bg-claude-orange-dark"
                        size="sm"
                      >
                        <Mail className="w-3 h-3 mr-2" />Generate Email
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Email Preview */}
              {email && selectedBusiness && (
                <Card className="p-6 mt-6">
                  <h3 className="text-xl font-serif mb-4">Generated Email for {selectedBusiness.name}</h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Subject</label>
                      <Input value={email.subject_line} readOnly />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Email Body</label>
                      <Textarea
                        value={email.email_body}
                        rows={12}
                        className="font-mono text-sm"
                        readOnly
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

                    <Button
                      onClick={() => {
                        navigator.clipboard.writeText(`Subject: ${email.subject_line}\n\n${email.email_body}`);
                        toast.success('Email copied to clipboard!');
                      }}
                      variant="outline"
                      className="w-full"
                    >
                      Copy Email to Clipboard
                    </Button>
                  </div>
                </Card>
              )}
            </div>
          )}
        </TabsContent>

        {/* SETTINGS TAB */}
        <TabsContent value="settings">
          <Card className="p-6">
            <h2 className="text-2xl font-serif mb-4">Settings</h2>
            <p className="text-claude-gray">Prompt editing and API configuration coming soon...</p>
          </Card>
        </TabsContent>

        {/* HISTORY TAB */}
        <TabsContent value="history">
          <Card className="p-6">
            <h2 className="text-2xl font-serif mb-4">Search History</h2>
            <p className="text-claude-gray">History feature coming soon...</p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
