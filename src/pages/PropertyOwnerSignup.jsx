import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, Mail, User, Phone, Briefcase } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function PropertyOwnerSignup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    type: 'individual',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await base44.entities.PropertyOwner.create({
        ...formData,
        subscription_plan: 'free',
        monthly_fee: 0,
        properties_count: 0,
        status: 'trial'
      });

      toast.success('Registration successful! Welcome to Modero.');
      navigate('/Dashboard');
    } catch (error) {
      toast.error('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-6">
      <Card className="w-full max-w-2xl shadow-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto h-16 w-16 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
            <span className="text-white text-3xl font-bold">M</span>
          </div>
          <div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Modero
            </CardTitle>
            <CardDescription className="text-base mt-2">
              Join the automated tenant screening platform
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="name"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="phone"
                    placeholder="+34 600 123 456"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Account Type *</Label>
                <Select value={formData.type} onValueChange={(value) => handleChange('type', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">Individual Owner</SelectItem>
                    <SelectItem value="agency">Real Estate Agency</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="company">Company/Agency Name</Label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="company"
                    placeholder="Optional"
                    value={formData.company}
                    onChange={(e) => handleChange('company', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
              <h4 className="font-semibold text-indigo-900 mb-2">Free Trial Included</h4>
              <ul className="text-sm text-indigo-700 space-y-1">
                <li>✓ 14-day free trial</li>
                <li>✓ AI-powered tenant screening</li>
                <li>✓ Automated KYC verification</li>
                <li>✓ Credit check integration</li>
              </ul>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-6 text-lg font-semibold"
              disabled={isLoading}
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>

            <p className="text-center text-sm text-slate-600">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => base44.auth.redirectToLogin()}
                className="text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Sign In
              </button>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}