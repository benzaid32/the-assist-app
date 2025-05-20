
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Camera, FileText, Upload, CheckCircle, XCircle } from 'lucide-react';

interface DocumentUploadProps {
  onComplete: () => void;
}

const DocumentUpload = ({ onComplete }: DocumentUploadProps) => {
  const [idFront, setIdFront] = useState<File | null>(null);
  const [idBack, setIdBack] = useState<File | null>(null);
  const [billDoc, setBillDoc] = useState<File | null>(null);
  const [ssnDoc, setSsnDoc] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState("id");
  
  const handleIdFrontUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIdFront(e.target.files[0]);
    }
  };
  
  const handleIdBackUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIdBack(e.target.files[0]);
    }
  };
  
  const handleBillUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setBillDoc(e.target.files[0]);
    }
  };
  
  const handleSsnUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSsnDoc(e.target.files[0]);
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would upload these files to your server
    console.log('Documents submitted:', { idFront, idBack, billDoc, ssnDoc });
    onComplete();
  };
  
  const canContinue = () => {
    if (activeTab === "id") {
      return idFront !== null && idBack !== null;
    } else {
      return billDoc !== null && ssnDoc !== null;
    }
  };
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };
  
  const handleNextTab = () => {
    if (activeTab === "id") {
      setActiveTab("documents");
    } else {
      handleSubmit(new Event('submit') as unknown as React.FormEvent);
    }
  };
  
  const getPreviewUrl = (file: File | null) => {
    return file ? URL.createObjectURL(file) : null;
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Document Verification</CardTitle>
        <CardDescription>
          Please upload the required documents
        </CardDescription>
      </CardHeader>
      
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="id">ID Verification</TabsTrigger>
          <TabsTrigger value="documents">Bills & SSN</TabsTrigger>
        </TabsList>
        
        <TabsContent value="id">
          <CardContent className="space-y-4 pt-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Front of ID</p>
              <label className={`upload-area ${idFront ? 'border-green-300' : 'border-gray-300'}`}>
                {idFront ? (
                  <div className="w-full space-y-2">
                    <img 
                      src={getPreviewUrl(idFront)} 
                      alt="ID Front" 
                      className="h-36 mx-auto object-contain"
                    />
                    <div className="flex items-center justify-center text-sm text-green-600 font-medium">
                      <CheckCircle className="mr-1 h-4 w-4" />
                      <span>{idFront.name}</span>
                    </div>
                  </div>
                ) : (
                  <>
                    <Camera className="h-10 w-10 text-gray-400" />
                    <p className="mt-2 text-sm font-medium text-gray-600">Upload front of ID</p>
                    <p className="text-xs text-gray-400">Click or drag image here</p>
                  </>
                )}
                <input 
                  type="file" 
                  accept="image/*" 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={handleIdFrontUpload}
                />
              </label>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-medium">Back of ID</p>
              <label className={`upload-area ${idBack ? 'border-green-300' : 'border-gray-300'}`}>
                {idBack ? (
                  <div className="w-full space-y-2">
                    <img 
                      src={getPreviewUrl(idBack)} 
                      alt="ID Back" 
                      className="h-36 mx-auto object-contain"
                    />
                    <div className="flex items-center justify-center text-sm text-green-600 font-medium">
                      <CheckCircle className="mr-1 h-4 w-4" />
                      <span>{idBack.name}</span>
                    </div>
                  </div>
                ) : (
                  <>
                    <Camera className="h-10 w-10 text-gray-400" />
                    <p className="mt-2 text-sm font-medium text-gray-600">Upload back of ID</p>
                    <p className="text-xs text-gray-400">Click or drag image here</p>
                  </>
                )}
                <input 
                  type="file" 
                  accept="image/*" 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={handleIdBackUpload}
                />
              </label>
            </div>
          </CardContent>
        </TabsContent>
        
        <TabsContent value="documents">
          <CardContent className="space-y-4 pt-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Utility Bill or Rent Statement</p>
              <label className={`upload-area ${billDoc ? 'border-green-300' : 'border-gray-300'}`}>
                {billDoc ? (
                  <div className="w-full space-y-2">
                    <FileText className="h-10 w-10 text-green-500 mx-auto" />
                    <div className="flex items-center justify-center text-sm text-green-600 font-medium">
                      <CheckCircle className="mr-1 h-4 w-4" />
                      <span>{billDoc.name}</span>
                    </div>
                  </div>
                ) : (
                  <>
                    <FileText className="h-10 w-10 text-gray-400" />
                    <p className="mt-2 text-sm font-medium text-gray-600">Upload bill document</p>
                    <p className="text-xs text-gray-400">PDF, JPG or PNG format</p>
                  </>
                )}
                <input 
                  type="file" 
                  accept=".pdf,image/*" 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={handleBillUpload}
                />
              </label>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-medium">Last 4 Digits of SSN</p>
              <label className={`upload-area ${ssnDoc ? 'border-green-300' : 'border-gray-300'}`}>
                {ssnDoc ? (
                  <div className="w-full space-y-2">
                    <FileText className="h-10 w-10 text-green-500 mx-auto" />
                    <div className="flex items-center justify-center text-sm text-green-600 font-medium">
                      <CheckCircle className="mr-1 h-4 w-4" />
                      <span>{ssnDoc.name}</span>
                    </div>
                  </div>
                ) : (
                  <>
                    <Upload className="h-10 w-10 text-gray-400" />
                    <p className="mt-2 text-sm font-medium text-gray-600">Upload SSN document</p>
                    <p className="text-xs text-gray-400">Only last 4 digits should be visible</p>
                  </>
                )}
                <input 
                  type="file" 
                  accept=".pdf,image/*" 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={handleSsnUpload}
                />
              </label>
            </div>
          </CardContent>
        </TabsContent>
      </Tabs>
      
      <CardFooter>
        <Button 
          className="w-full bg-uplift-primary hover:bg-blue-600"
          onClick={handleNextTab}
          disabled={!canContinue()}
        >
          {activeTab === "id" ? "Next" : "Submit Documents"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DocumentUpload;
