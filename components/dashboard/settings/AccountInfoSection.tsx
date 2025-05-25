'use client';

import { Card, Grid, FormSection } from '@/components/ui';

interface User {
  email?: string;
  name?: string;
}

interface AccountInfoSectionProps {
  user: User | null;
}

export default function AccountInfoSection({ user }: AccountInfoSectionProps) {
  return (
    <FormSection
      title="Informații cont"
      subtitle="Detaliile contului tău"
      className="mb-8"
    >
      <Grid cols={2} gap="md">
        <Card className="p-4" hover>
          <div className="flex items-center mb-2 text-text-secondary">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
            <p className="text-sm">Email</p>
          </div>
          <p className="text-base sm:text-lg font-medium">{user?.email}</p>
        </Card>

        <Card className="p-4" hover>
          <div className="flex items-center mb-2 text-text-secondary">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
            <p className="text-sm">Nume</p>
          </div>
          <p className="text-base sm:text-lg font-medium">{user?.name}</p>
        </Card>
      </Grid>
    </FormSection>
  );
}