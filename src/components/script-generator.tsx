import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { Edit, FileUp, Sparkles } from 'lucide-react';

// Types for script generation
export interface ScriptGenerationProps {
  productName: string;
  audience: string;
  description: string;
  keyFeatures: string;
  painPoints: string;
  tone: string;
  format: string;
  template: string;
  audienceType: string;
}

// Improved API call function with better error handling
export async function callAIApi(data: ScriptGenerationProps): Promise<any> {
  try {
    const response = await fetch('/api/generate-script', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      // Check if response is HTML (error page) instead of JSON
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('text/html')) {
        throw new Error('Server error: The API returned an HTML error page instead of JSON');
      }
      
      // Try to parse error as JSON, but handle case where it's not JSON
      try {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate script');
      } catch (parseError) {
        throw new Error('Server error: Could not process the response');
      }
    }

    // Try to parse response as JSON, but handle case where it's not JSON
    try {
      return await response.json();
    } catch (parseError) {
      throw new Error('Invalid response format from server');
    }
  } catch (error: any) {
    console.error('Error calling API:', error);
    throw new Error(error.message || 'Failed to generate script. Please try again.');
  }
}

// Mock function for script generation (used before API integration)
function generateMockScript(data: ScriptGenerationProps) {
  return {
    script: `# ${data.productName} Demo Script\n\n## Introduction\nHello and welcome! Today I'm excited to show you ${data.productName}, which helps ${data.audience} to solve ${data.painPoints}.\n\n## Problem Statement\n${data.painPoints}\n\n## Solution Overview\n${data.description}\n\n## Key Features\n${data.keyFeatures.split(',').map(feature => `- ${feature.trim()}`).join('\n')}\n\n## Benefits\nBy using ${data.productName}, you'll be able to:\n- Save time and resources\n- Improve efficiency\n- Enhance your overall experience\n\n## Demonstration\nLet me show you how it works...\n\n## Closing\nThank you for your time today. Any questions?`,
    talkingPoints: `• Introduce ${data.productName}\n• Mention target audience: ${data.audience}\n• Highlight pain points: ${data.painPoints}\n• Explain solution: ${data.description}\n• Demo key features:\n${data.keyFeatures.split(',').map(feature => `  - ${feature.trim()}`).join('\n')}\n• Emphasize benefits\n• Provide demonstration\n• Close and ask for questions`
  };
}

export default function ScriptGenerator() {
  // State for form inputs
  const [productName, setProductName] = useState('');
  const [audience, setAudience] = useState('');
  const [description, setDescription] = useState('');
  const [keyFeatures, setKeyFeatures] = useState('');
  const [painPoints, setPainPoints] = useState('');
  const [tone, setTone] = useState('professional');
  const [format, setFormat] = useState('problem-solution');
  const [template, setTemplate] = useState('universal');
  const [audienceType, setAudienceType] = useState('mixed');
  
  // State for script generation
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [script, setScript] = useState<string>('');
  const [talkingPoints, setTalkingPoints] = useState<string>('');
  const [viewMode, setViewMode] = useState<'detailed' | 'talking-points'>('detailed');
  const [showResult, setShowResult] = useState(false);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setError(null);
    
    const data: ScriptGenerationProps = {
      productName,
      audience,
      description,
      keyFeatures,
      painPoints,
      tone,
      format,
      template,
      audienceType
    };
    
    try {
      // Call the API
      const result = await callAIApi(data);
      setScript(result.script);
      setTalkingPoints(result.talkingPoints);
      setShowResult(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {!showResult ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Information</TabsTrigger>
              <TabsTrigger value="customization">Customization</TabsTrigger>
              <TabsTrigger value="advanced">Advanced Options</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="space-y-4">
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="productName">Product Name</Label>
                  <Input 
                    id="productName" 
                    placeholder="e.g., SalesForce CRM" 
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    required
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="audience">Target Audience</Label>
                  <Input 
                    id="audience" 
                    placeholder="e.g., Sales managers at mid-size companies" 
                    value={audience}
                    onChange={(e) => setAudience(e.target.value)}
                    required
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="description">Product Description</Label>
                  <Textarea 
                    id="description" 
                    placeholder="Briefly describe what your product does and its main value proposition" 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="keyFeatures">Key Features (comma separated)</Label>
                  <Textarea 
                    id="keyFeatures" 
                    placeholder="e.g., Real-time analytics, Custom reporting, Mobile access" 
                    value={keyFeatures}
                    onChange={(e) => setKeyFeatures(e.target.value)}
                    required
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="painPoints">Pain Points Addressed</Label>
                  <Textarea 
                    id="painPoints" 
                    placeholder="What problems does your product solve for the audience?" 
                    value={painPoints}
                    onChange={(e) => setPainPoints(e.target.value)}
                    required
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="customization" className="space-y-4">
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="tone">Tone</Label>
                  <Select value={tone} onValueChange={setTone}>
                    <SelectTrigger id="tone">
                      <SelectValue placeholder="Select tone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="conversational">Conversational</SelectItem>
                      <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
                      <SelectItem value="technical">Technical</SelectItem>
                      <SelectItem value="educational">Educational</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="format">Format</Label>
                  <Select value={format} onValueChange={setFormat}>
                    <SelectTrigger id="format">
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="problem-solution">Problem-Solution</SelectItem>
                      <SelectItem value="feature-benefit">Feature-Benefit</SelectItem>
                      <SelectItem value="storytelling">Storytelling</SelectItem>
                      <SelectItem value="comparison">Comparison</SelectItem>
                      <SelectItem value="case-study">Case Study</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="template">Template</Label>
                  <Select value={template} onValueChange={setTemplate}>
                    <SelectTrigger id="template">
                      <SelectValue placeholder="Select template" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="universal">Universal Demo Template</SelectItem>
                      <SelectItem value="saas">SaaS Product Demo</SelectItem>
                      <SelectItem value="ecommerce">E-commerce Platform Demo</SelectItem>
                      <SelectItem value="healthcare">Healthcare Solution Demo</SelectItem>
                      <SelectItem value="financial">Financial Services Demo</SelectItem>
                      <SelectItem value="manufacturing">Manufacturing Solution Demo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="audienceType">Audience Type (for branching)</Label>
                  <Select value={audienceType} onValueChange={setAudienceType}>
                    <SelectTrigger id="audienceType">
                      <SelectValue placeholder="Select audience type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mixed">Mixed Audience</SelectItem>
                      <SelectItem value="technical">Technical Decision Makers</SelectItem>
                      <SelectItem value="business">Business Decision Makers</SelectItem>
                      <SelectItem value="end-users">End Users</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="advanced" className="space-y-4">
              <div className="grid gap-4 py-4">
                <div className="flex items-center space-x-2">
                  <Checkbox id="includeQA" />
                  <Label htmlFor="includeQA">Include Q&A section</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox id="includeObjHandling" />
                  <Label htmlFor="includeObjHandling">Include objection handling</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox id="includeROI" />
                  <Label htmlFor="includeROI">Include ROI calculation</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox id="includeCompetitive" />
                  <Label htmlFor="includeCompetitive">Include competitive comparison</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox id="includeTimeline" />
                  <Label htmlFor="includeTimeline">Include implementation timeline</Label>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="flex justify-between">
            <Button type="button" variant="outline">
              <FileUp className="h-4 w-4 mr-2" />
              Upload Previous Script
            </Button>
            <Button type="submit" disabled={isGenerating}>
              <Sparkles className="h-4 w-4 mr-2" />
              {isGenerating ? 'Generating...' : 'Generate Script'}
            </Button>
          </div>
          
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-md text-red-600 dark:text-red-400">
              {error}
            </div>
          )}
        </form>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Your Generated Script</h2>
            <div className="flex space-x-2">
              <Button 
                variant={viewMode === 'detailed' ? 'default' : 'outline'} 
                onClick={() => setViewMode('detailed')}
              >
                Full Script
              </Button>
              <Button 
                variant={viewMode === 'talking-points' ? 'default' : 'outline'} 
                onClick={() => setViewMode('talking-points')}
              >
                Talking Points
              </Button>
              <Button variant="outline" onClick={() => setShowResult(false)}>
                Back to Editor
              </Button>
            </div>
          </div>
          
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="border-b bg-muted/50 p-4 flex justify-between items-center">
                <div>
                  <h3 className="font-medium">
                    {viewMode === "detailed" ? "Full Script" : "Talking Points"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {viewMode === "detailed" 
                      ? "Complete script with all details and phrasing" 
                      : "Condensed outline with key points to remember"}
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              </div>
              
              <div className="p-6 max-h-[600px] overflow-y-auto prose prose-slate dark:prose-invert">
                <div dangerouslySetInnerHTML={{ 
                  __html: viewMode === "detailed" 
                    ? (typeof script === 'string' ? script.replace(/\n/g, '<br>') : String(script)) 
                    : (typeof talkingPoints === 'string' ? talkingPoints.replace(/\n/g, '<br>') : String(talkingPoints)) 
                }} />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>AI Analysis & Suggestions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-medium mb-2">Script Quality</h4>
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm">Clarity</span>
                        <span className="text-sm font-medium">85%</span>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                        <div className="h-2 bg-blue-600 rounded-full" style={{ width: '85%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm">Engagement</span>
                        <span className="text-sm font-medium">78%</span>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                        <div className="h-2 bg-blue-600 rounded-full" style={{ width: '78%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm">Persuasiveness</span>
                        <span className="text-sm font-medium">82%</span>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                        <div className="h-2 bg-blue-600 rounded-full" style={{ width: '82%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Improvement Suggestions</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 p-1 rounded mr-2">•</span>
                      <span>Consider adding more specific examples to illustrate key features</span>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 p-1 rounded mr-2">•</span>
                      <span>The introduction could be more attention-grabbing</span>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 p-1 rounded mr-2">•</span>
                      <span>Add more transition phrases between sections for smoother flow</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="flex justify-between">
            <Button variant="outline">
              Download as PDF
            </Button>
            <div className="space-x-2">
              <Button variant="outline">
                Share
              </Button>
              <Button>
                Save to My Scripts
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
