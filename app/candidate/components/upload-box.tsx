import React, { useState, useEffect } from 'react';
import Dropzone, { FileWithPath } from 'react-dropzone';
import { PlusIcon } from '@heroicons/react/24/solid';
import { uploadResumeToStorage } from '@/lib/candidate/resume-upload';
import { resumeUnconfirmedAddToDatabase } from '@/lib/candidate/resume-upload-entry';
import getIdentityUUID from '@/lib/candidate/uuid-create';
import { useSignUp } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { createId } from "@paralleldrive/cuid2";
import { updatePublicMetadata } from "@/app/(main)/actions";

const ResumeUploadBox: React.FC = () => {
  const [file, setFile] = useState<FileWithPath | null>(null);
  const [showSignUp, setShowSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [showVerification, setShowVerification] = useState(false);
  const { isLoaded, signUp, setActive } = useSignUp();
  const [candidateId, setCandidateId] = useState('');
  const [candidateSignature, setCandidateSignature] = useState('');

  useEffect(() => {
    const fetchIdentity = async () => {
      const { newUUID, newFingerprint } = await getIdentityUUID();
      setCandidateId(newUUID);
      setCandidateSignature(newFingerprint);
    };
    fetchIdentity();
  }, []);

  const onFileAdded = (acceptedFiles: FileWithPath[]) => {
    if (acceptedFiles.length === 0) {
      toast.error('No file selected.');
      return;
    }
    setFile(acceptedFiles[0]);
    setShowSignUp(true);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isLoaded || !signUp) return;

    try {
      await signUp.create({
        emailAddress: email,
        password,
      });

      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setShowVerification(true);
      toast.success('Please check your email for the verification code.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'An error occurred during sign up.');
    }
  };

  const handleVerification = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!signUp) return;

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code: verificationCode,
      });
      if (completeSignUp.status !== 'complete') {
        console.log(JSON.stringify(completeSignUp, null, 2));
      } else {
        if (completeSignUp.createdSessionId) {
          await setActive({ session: completeSignUp.createdSessionId });

          // Update public metadata using the server action
          const cuid = createId();
          if (completeSignUp.createdUserId) {
            await updatePublicMetadata(completeSignUp.createdUserId, {
              role: 'talent',
              cuid,
            });
          }

          toast.success('Email verified successfully!');
          handleFileUpload();
        }
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error verifying email');
    }
  };

  const handleFileUpload = async () => {
    if (!file) {
      toast.error('No file selected.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const uploadResult = await uploadResumeToStorage(formData);
      if (uploadResult && uploadResult.success && uploadResult.id) {
        const addResult = await resumeUnconfirmedAddToDatabase(
          candidateId,
          uploadResult.id,
          email
        );

        if (addResult && addResult.success) {
          toast.success('Resume uploaded and confirmed successfully.');
        } else {
          toast.error('Failed to confirm resume upload.');
        }
      } else {
        toast.error('Failed to upload resume.');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Error during file upload.');
    }
  };

  return (
    <div className="w-full max-w-md">
      {!file && (
        <Dropzone onDrop={onFileAdded} multiple={false}>
          {({ getRootProps, getInputProps }) => (
            <div {...getRootProps()} className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer">
              <input {...getInputProps()} />
              <PlusIcon className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">Click or drag file to upload</p>
            </div>
          )}
        </Dropzone>
      )}
      {file && showSignUp && !showVerification && (
        <Card>
          <CardHeader>
            <CardTitle>Sign Up</CardTitle>
            <CardDescription>Create an account to upload your resume</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent>
              <div className="grid w-full items-center gap-4">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    placeholder="Enter your email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    placeholder="Enter your password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full">Sign Up</Button>
            </CardFooter>
          </form>
        </Card>
      )}
      {showVerification && (
        <Card>
          <CardHeader>
            <CardTitle>Verify Email</CardTitle>
            <CardDescription>Enter the verification code sent to your email</CardDescription>
          </CardHeader>
          <form onSubmit={handleVerification}>
            <CardContent>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="verificationCode">Verification Code</Label>
                <Input
                  id="verificationCode"
                  placeholder="Enter verification code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full">Verify Email</Button>
            </CardFooter>
          </form>
        </Card>
      )}
    </div>
  );
};

export default ResumeUploadBox;