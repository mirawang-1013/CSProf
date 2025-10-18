import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { GraduationCap, Building2 } from 'lucide-react';
import PhDGraduateSearch from './pages/PhDGraduateSearch';
import UniversityComparison from './pages/UniversityComparison';

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50/30">
      <div className="border-b border-slate-200 bg-white shadow-sm">
        <div className="px-8 py-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 bg-slate-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">R</span>
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">Research Platform</h1>
              <p className="text-slate-600 mt-1">
                Discover PhD graduates and compare university research performance
              </p>
            </div>
          </div>
          
          <Tabs defaultValue="graduates" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="graduates" className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4" />
                PhD Graduate Search
              </TabsTrigger>
              <TabsTrigger value="comparison" className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                University Comparison
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="graduates" className="mt-6">
              <PhDGraduateSearch />
            </TabsContent>
            
            <TabsContent value="comparison" className="mt-6">
              <UniversityComparison />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
