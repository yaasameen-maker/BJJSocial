
import React, { useState } from 'react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';

interface SearchResult {
  id: string;
  type: 'user' | 'post' | 'tournament';
  title: string;
  description: string;
}

const Search: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchTerm)}`);
      if (response.ok) {
        const data = await response.json();
        setResults(data.results);
      } else {
        console.error('Search failed');
        setResults([]);
      }
    } catch (error) {
      console.error('Error during search:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-4 text-center">Search</h1>
        <div className="flex w-full max-w-sm items-center space-x-2 mx-auto">
          <Input 
            type="text" 
            placeholder="Search for users, posts, or tournaments" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button type="submit" onClick={handleSearch} disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </Button>
        </div>

        <div className="mt-8">
          {results.length > 0 ? (
            <div className="space-y-4">
              {results.map(result => (
                <Card key={result.id} className="p-4">
                  <h2 className="font-bold">{result.title}</h2>
                  <p className="text-sm text-muted-foreground">{result.type}</p>
                  <p className="mt-2">{result.description}</p>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">
              {loading ? '' : 'No results found.'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Search;
