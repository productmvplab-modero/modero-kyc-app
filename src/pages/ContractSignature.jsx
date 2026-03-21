import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { FileText, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ContractSignature() {
  const [token, setToken] = useState(null);
  const [role, setRole] = useState(null);
  const [signatureName, setSignatureName] = useState('');
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get('token');
    const r = params.get('role');
    setToken(t);
    setRole(r);
  }, []);

  // Fetch contract by token
  useEffect(() => {
    const fetchContract = async () => {
      if (!token) return;
      try {
        const contracts = await base44.entities.RentalContract.filter({ signing_token: token });
        if (contracts && contracts.length > 0) {
          setContract(contracts[0]);
        }
      } catch (error) {
        console.error('Error fetching contract:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContract();
  }, [token]);

  const signMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('signContract', {
        token,
        role,
        signature_name: signatureName,
      });
      return response.data;
    },
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50/30 flex items-center justify-center px-4">
        <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50/30 flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-slate-600">Contract not found. Please check your signing link.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isAlreadySigned = role === 'tenant' ? contract.tenant_signed : contract.landlord_signed;
  const otherPartySigned = role === 'tenant' ? contract.landlord_signed : contract.tenant_signed;
  const partyName = role === 'tenant' ? contract.tenant_name : contract.landlord_name;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50/30 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <FileText className="w-8 h-8 text-orange-600" />
            <h1 className="text-3xl font-bold text-orange-600">Sign Rental Contract</h1>
          </div>
          <p className="text-slate-600">Property: <strong>{contract.property_address}</strong></p>
        </div>

        {/* Contract Content */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Contract Terms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-slate-50 rounded-lg p-6 max-h-96 overflow-y-auto">
              <pre className="text-sm text-slate-700 whitespace-pre-wrap font-mono">
                {contract.contract_content}
              </pre>
            </div>
          </CardContent>
        </Card>

        {/* Signature Section */}
        {isAlreadySigned ? (
          <Card className="mb-6 border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 text-green-700">
                <CheckCircle2 className="w-6 h-6" />
                <div>
                  <p className="font-semibold">Already Signed</p>
                  <p className="text-sm text-green-600">You have already signed this contract. Awaiting the other party to complete.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Your Signature</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-600">
                By typing your name below and clicking "Sign Contract", you agree to the terms and conditions above.
              </p>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Type Your Full Name</label>
                <Input
                  type="text"
                  placeholder="Enter your full name"
                  value={signatureName}
                  onChange={(e) => setSignatureName(e.target.value)}
                  className="text-lg h-12"
                />
              </div>

              <div className="bg-slate-50 rounded-lg p-4 border-2 border-dashed border-slate-300">
                <p className="text-sm text-slate-600 mb-2">Your signature:</p>
                <p className="text-lg font-script text-slate-800" style={{ fontStyle: 'italic', fontFamily: 'cursive' }}>
                  {signatureName || '(Your name appears here)'}
                </p>
              </div>

              <Button
                onClick={() => signMutation.mutate()}
                disabled={!signatureName.trim() || signMutation.isPending || isAlreadySigned}
                className="w-full h-12 bg-orange-600 hover:bg-orange-700 text-white font-semibold text-lg"
              >
                {signMutation.isPending ? 'Signing...' : 'Sign Contract'}
              </Button>

              {signMutation.isSuccess && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-green-700">Contract Signed Successfully!</p>
                      <p className="text-sm text-green-600 mt-1">
                        {role === 'tenant' ? 'The landlord will now need to review and sign the contract.' : 'Both parties have now signed the contract. It is legally binding.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {signMutation.isError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-700 text-sm">{signMutation.error.message || 'Error signing contract. Please try again.'}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Status Summary */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Signature Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className={`p-4 rounded-lg ${contract.tenant_signed ? 'bg-green-50 border border-green-200' : 'bg-slate-50 border border-slate-200'}`}>
                <p className="text-sm text-slate-600 mb-1">Tenant</p>
                <p className="font-semibold text-slate-800">{contract.tenant_signed ? '✓ Signed' : '○ Pending'}</p>
              </div>
              <div className={`p-4 rounded-lg ${contract.landlord_signed ? 'bg-green-50 border border-green-200' : 'bg-slate-50 border border-slate-200'}`}>
                <p className="text-sm text-slate-600 mb-1">Landlord</p>
                <p className="font-semibold text-slate-800">{contract.landlord_signed ? '✓ Signed' : '○ Pending'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}