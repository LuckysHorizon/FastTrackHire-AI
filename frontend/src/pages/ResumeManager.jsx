import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useAuth } from '../context/AuthContext';
import { Upload, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { Viewer, Worker } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';

const ResumeManager = () => {
  const { API_URL } = useAuth();
  const [loading, setLoading] = useState(false);
  const [resumeData, setResumeData] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchResume();
  }, [API_URL]);

  const fetchResume = async () => {
    setError(null);
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await axios.get(`${API_URL}/resume?token=${token}`);
      setResumeData(res.data);
      if (res.data.has_resume) {
        setPdfUrl(`${API_URL}/resume/pdf?token=${token}`);
      }
    } catch (err) {
      console.error(err);
      // Don't set error here as 404 is normal for new users
    }
  };

  const onDrop = async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setError(null);
    setLoading(true);
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('token', token);

    try {
      await axios.post(`${API_URL}/resume/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      fetchResume();
      // Set local preview
      const url = URL.createObjectURL(file);
      setPdfUrl(url);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || "Failed to process document intelligence.");
    } finally {
      setLoading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false
  });

  return (
    <DashboardLayout>
      <div className="max-w-[1000px] mx-auto pt-8 pb-12">
        <h2 className="font-serif text-[36px] font-bold text-accent mb-2">Resume Intelligence</h2>
        <p className="text-text-secondary mb-10 text-[16px]">Manage your credentials for AI simulation alignment.</p>

        {error && (
          <div className="bg-error/10 border border-error/20 p-4 rounded-xl flex items-center text-error text-[14px] font-medium mb-8">
             <AlertCircle className="w-5 h-5 mr-3" /> {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="lg:col-span-1 space-y-6">
              <Card>
                 <h4 className="font-bold text-[16px] mb-6 text-accent">Credential Status</h4>
                 {resumeData?.has_resume ? (
                   <div className="flex items-center text-success font-medium text-[15px]">
                     <CheckCircle2 className="w-5 h-5 mr-3" /> Active Profile
                   </div>
                 ) : (
                   <div className="flex items-center text-warning font-medium text-[15px]">
                     <AlertCircle className="w-5 h-5 mr-3" /> No Resume Uploaded
                   </div>
                 )}
                 {resumeData?.uploaded_at && (
                    <div className="mt-8 pt-6 border-t border-bg-muted">
                      <p className="text-[11px] uppercase tracking-widest text-text-tertiary font-bold mb-1">Last Analysis</p>
                      <p className="text-[14px] text-text-primary">
                        {new Date(resumeData.uploaded_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                 )}
              </Card>

              <div {...getRootProps()} className="cursor-pointer group">
                <input {...getInputProps()} />
                <Card className={`border-dashed border-2 flex flex-col items-center text-center p-10 transition-all ${isDragActive ? 'border-accent bg-accent-light' : 'border-bg-muted group-hover:border-accent group-hover:bg-bg-surface/50'}`}>
                   <div className="w-14 h-14 bg-bg-subtle rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <Upload className="w-7 h-7 text-text-secondary group-hover:text-accent transition-colors" />
                   </div>
                   <h5 className="font-bold text-[15px] mb-2 text-accent">Upload Document</h5>
                   <p className="text-[13px] text-text-tertiary leading-relaxed">
                     Drag and drop your PDF resume here, or click to browse.
                   </p>
                   {loading && (
                     <div className="mt-6 flex items-center text-accent text-[12px] font-bold uppercase tracking-widest animate-pulse">
                       <span className="w-2 h-2 rounded-full bg-accent mr-2"></span>
                       Analyzing Profile
                     </div>
                   )}
                </Card>
              </div>

              <Card className="bg-accent-light border-none">
                 <h5 className="font-bold text-[13px] uppercase tracking-wider text-accent mb-4">Intelligence Tip</h5>
                 <p className="text-[13px] text-text-secondary leading-relaxed">
                   Ensure your resume clearly lists your tech stack and core project responsibilities. Our AI uses this data to generate role-specific technical challenges.
                 </p>
              </Card>
           </div>

           <div className="lg:col-span-2">
              <Card className="h-[800px] p-0 overflow-hidden flex flex-col shadow-lg border-bg-muted">
                 <div className="p-4 border-b border-bg-muted flex items-center justify-between bg-bg-surface shrink-0">
                    <div className="flex items-center">
                      <FileText className="w-5 h-5 text-text-tertiary mr-3" />
                      <span className="text-[14px] font-bold text-accent">Credential Preview</span>
                    </div>
                    {resumeData?.has_resume && <Badge variant="success">Verified</Badge>}
                 </div>
                 <div className="flex-1 bg-bg-muted relative overflow-hidden">
                    {pdfUrl ? (
                      <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
                         <Viewer fileUrl={pdfUrl} />
                      </Worker>
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-text-tertiary bg-bg-surface/30">
                         <FileText className="w-16 h-16 mb-4 opacity-10" />
                         <p className="text-[15px] font-medium opacity-40 italic">No document selected for preview.</p>
                      </div>
                    )}
                 </div>
              </Card>
           </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ResumeManager;
