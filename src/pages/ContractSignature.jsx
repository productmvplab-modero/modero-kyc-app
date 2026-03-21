import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useLanguage } from '@/components/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import Header from '@/components/modero/Header';

export default function ContractSignature() {
  const { t } = useLanguage();
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
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50/30">
        <Header />
        <div className="flex items-center justify-center px-4 min-h-screen">
        <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
      </div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50/30">
        <Header />
        <div className="flex items-center justify-center px-4 min-h-screen">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-slate-600">{t('contract_not_found')}</p>
          </CardContent>
        </Card>
      </div>
      </div>
    );
  }

  const isAlreadySigned = role === 'tenant' ? contract.tenant_signed : contract.landlord_signed;
  const otherPartySigned = role === 'tenant' ? contract.landlord_signed : contract.tenant_signed;
  const partyName = role === 'tenant' ? contract.tenant_name : contract.landlord_name;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50/30">
      <Header />
      <div className="py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <FileText className="w-8 h-8 text-orange-600" />
            <h1 className="text-3xl font-bold text-orange-600">{t('sign_rental_contract')}</h1>
          </div>
          <p className="text-slate-600">{t('sign_contract_header')}: <strong>{contract.property_address}</strong></p>
        </div>

        {/* Contract Content */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">{t('contract_terms_label')}</CardTitle>
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
                  <p className="font-semibold">{t('already_signed')}</p>
                  <p className="text-sm text-green-600">{t('you_have_signed')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>{t('your_signature')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-600">
                {t('type_full_name')} "{t('sign_contract_btn')}", {t('type_full_name').toLowerCase()} you agree to the terms and conditions above.
              </p>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">{t('type_full_name')}</label>
                <Input
                  type="text"
                  placeholder={t('enter_full_name')}
                  value={signatureName}
                  onChange={(e) => setSignatureName(e.target.value)}
                  className="text-lg h-12"
                />
              </div>

              <div className="bg-slate-50 rounded-lg p-4 border-2 border-dashed border-slate-300">
                <p className="text-sm text-slate-600 mb-2">{t('your_signature')}:</p>
                <p className="text-lg font-script text-slate-800" style={{ fontStyle: 'italic', fontFamily: 'cursive' }}>
                  {signatureName || t('your_signature_preview')}
                </p>
              </div>

              <Button
                onClick={() => signMutation.mutate()}
                disabled={!signatureName.trim() || signMutation.isPending || isAlreadySigned}
                className="w-full h-12 bg-orange-600 hover:bg-orange-700 text-white font-semibold text-lg"
              >
                {signMutation.isPending ? t('signing_contract') : t('sign_contract_btn')}
              </Button>

              {signMutation.isSuccess && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-green-700">{t('contract_signed_success')}</p>
                      <p className="text-sm text-green-600 mt-1">
                        {role === 'tenant' ? t('tenant_will_sign_next') : t('both_parties_signed')}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {signMutation.isError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-700 text-sm">{signMutation.error.message || t('contract_signed_success')}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Status Summary */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">{t('signature_status')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className={`p-4 rounded-lg ${contract.tenant_signed ? 'bg-green-50 border border-green-200' : 'bg-slate-50 border border-slate-200'}`}>
                <p className="text-sm text-slate-600 mb-1">{t('tenant')}</p>
                <p className="font-semibold text-slate-800">{contract.tenant_signed ? '✓ ' + t('already_signed') : '○ ' + t('pending')}</p>
              </div>
              <div className={`p-4 rounded-lg ${contract.landlord_signed ? 'bg-green-50 border border-green-200' : 'bg-slate-50 border border-slate-200'}`}>
                <p className="text-sm text-slate-600 mb-1">{t('landlord')}</p>
                <p className="font-semibold text-slate-800">{contract.landlord_signed ? '✓ ' + t('already_signed') : '○ ' + t('pending')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      </div>
    </div>
  );
}