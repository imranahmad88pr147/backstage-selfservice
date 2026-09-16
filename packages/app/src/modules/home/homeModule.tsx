import { createFrontendModule } from '@backstage/frontend-plugin-api';
import {
  HomePageLayoutBlueprint,
  HomePageWidgetBlueprint,
} from '@backstage/plugin-home-react/alpha';
import { Link } from '@backstage/core-components';
import { Fragment, type ReactNode } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import { useTheme } from '@mui/material/styles';
// ---------------------------------------------------------------------------
// Lightweight inline icons (no @mui/icons-material dependency required)
// ---------------------------------------------------------------------------

type IconProps = { size?: number };

const iconSvgProps = (size: number) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
});

const RocketIcon = ({ size = 22 }: IconProps) => (
  <svg {...iconSvgProps(size)}>
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
    <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
    <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
    <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
  </svg>
);

const TreeIcon = ({ size = 22 }: IconProps) => (
  <svg {...iconSvgProps(size)}>
    <circle cx="18" cy="6" r="2.5" />
    <circle cx="6" cy="18" r="2.5" />
    <circle cx="18" cy="18" r="2.5" />
    <path d="M15.5 6.5H9a3 3 0 0 0-3 3v4" />
    <path d="M15.5 18h-4" />
  </svg>
);

const CloudSyncIcon = ({ size = 22 }: IconProps) => (
  <svg {...iconSvgProps(size)}>
    <path d="M7.5 18a4.5 4.5 0 0 1-.4-8.98A6 6 0 0 1 18.7 8a4 4 0 0 1-.7 8H16" />
    <path d="M9 15l3-3 3 3M12 12v6" />
  </svg>
);

const LayersIcon = ({ size = 22 }: IconProps) => (
  <svg {...iconSvgProps(size)}>
    <path d="M12 2l9 5-9 5-9-5 9-5z" />
    <path d="M3 12l9 5 9-5" />
    <path d="M3 17l9 5 9-5" />
  </svg>
);

const ShieldIcon = ({ size = 22 }: IconProps) => (
  <svg {...iconSvgProps(size)}>
    <path d="M12 2l8 4v6c0 5-3.4 8.4-8 10-4.6-1.6-8-5-8-10V6l8-4z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
);

const ServerIcon = ({ size = 22 }: IconProps) => (
  <svg {...iconSvgProps(size)}>
    <rect x="3" y="4" width="18" height="6" rx="1.5" />
    <rect x="3" y="14" width="18" height="6" rx="1.5" />
    <path d="M7 7h.01M7 17h.01" />
  </svg>
);

const QuoteIcon = ({ size = 28 }: IconProps) => (
  <svg {...iconSvgProps(size)} fill="currentColor" stroke="none">
    <path d="M9.5 7C6.5 8.5 5 11 5 14a3.5 3.5 0 1 0 3.5 3.5c0-.9-.3-1.7-.9-2.3.4-2 1.7-3.6 3.4-4.6L9.5 7zM18 7c-3 1.5-4.5 4-4.5 7a3.5 3.5 0 1 0 3.5 3.5c0-.9-.3-1.7-.9-2.3.4-2 1.7-3.6 3.4-4.6L18 7z" />
  </svg>
);

const ArrowIcon = ({ size = 20 }: IconProps) => (
  <svg {...iconSvgProps(size)}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

// ---------------------------------------------------------------------------
// Content model
// ---------------------------------------------------------------------------

type Feature = {
  icon: ReactNode;
  title: string;
  description: string;
};

const FEATURES: Feature[] = [
  {
    icon: <TreeIcon />,
    title: 'Standardized service structure',
    description:
      'Every service is scaffolded from an approved Golden Path template, so structure and conventions stay consistent across teams.',
  },
  {
    icon: <ServerIcon />,
    title: 'Automated infrastructure provisioning',
    description:
      'Required AWS infrastructure is provisioned automatically with Terraform — no manual setup required.',
  },
  {
    icon: <CloudSyncIcon />,
    title: 'Automated CI/CD',
    description:
      'A ready-to-go pipeline builds, tests, and deploys your service the moment the repository is created.',
  },
  {
    icon: <LayersIcon />,
    title: 'Dev, staging & production',
    description:
      'Every service ships with isolated Development, Staging, and Production environments out of the box.',
  },
  {
    icon: <ShieldIcon />,
    title: 'Organization-approved standards',
    description:
      'Golden Path templates encode security, compliance, and engineering standards so you inherit best practice by default.',
  },
];

const STEPS: { label: string; title: string; description: string }[] = [
  {
    label: '1',
    title: 'Choose your service',
    description: 'Select the type of healthcare service you want to create.',
  },
  {
    label: '2',
    title: 'Configure your environment',
    description: 'Choose Development, Staging, or Production.',
  },
  {
    label: '3',
    title: 'Create your service',
    description:
      'The platform generates a standardized GitHub repository from the selected template.',
  },
  {
    label: '4',
    title: 'Deploy automatically',
    description:
      "The repository's CI/CD pipeline provisions the required AWS infrastructure using Terraform.",
  },
];

// ---------------------------------------------------------------------------
// Presentation
// ---------------------------------------------------------------------------

const HeroSection = () => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 3,
        px: { xs: 3, sm: 5, md: 8 },
        py: { xs: 5, sm: 7, md: 9 },
        mb: { xs: 4, md: 6 },
        color: theme.palette.getContrastText(theme.palette.primary.dark),
        background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 60%, ${theme.palette.info.dark} 100%)`,
      }}
    >
      {/* Decorative background accent */}
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          top: -80,
          right: -80,
          width: 260,
          height: 260,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.08)',
          display: { xs: 'none', sm: 'block' },
        }}
      />
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          bottom: -100,
          right: 120,
          width: 180,
          height: 180,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.06)',
          display: { xs: 'none', md: 'block' },
        }}
      />

      <Chip
        label="Internal Developer Platform"
        size="small"
        sx={{
          mb: 2,
          fontWeight: 600,
          color: 'inherit',
          bgcolor: 'rgba(255,255,255,0.16)',
        }}
      />

      <Typography
        variant="h3"
        component="h1"
        sx={{
          fontWeight: 800,
          fontSize: { xs: '1.9rem', sm: '2.5rem', md: '3rem' },
          lineHeight: 1.15,
          mb: 2,
          maxWidth: 760,
        }}
      >
        Healthcare Developer Portal
      </Typography>

      <Typography
        variant="h6"
        component="p"
        sx={{
          fontWeight: 400,
          opacity: 0.92,
          maxWidth: 640,
          mb: 4,
          fontSize: { xs: '1rem', sm: '1.15rem' },
        }}
      >
        A self-service platform for creating standardized healthcare
        services — golden-path templates, automated infrastructure, and
        CI/CD built in from the start.
      </Typography>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <Button
          component={Link}
          to="/create"
          variant="contained"
          size="large"
          sx={{
            bgcolor: 'common.white',
            color: theme.palette.primary.dark,
            fontWeight: 700,
            px: 3,
            '&:hover': { bgcolor: 'grey.100' },
          }}
        >
          Create a Service
        </Button>
      </Stack>
    </Box>
  );
};

const FeaturesSection = () => (
  <Box sx={{ mb: { xs: 5, md: 7 } }}>
    <Typography
      variant="overline"
      sx={{ fontWeight: 700, letterSpacing: 1, color: 'text.secondary' }}
    >
      What the platform provides
    </Typography>
    <Typography variant="h4" component="h2" sx={{ fontWeight: 700, mb: 3 }}>
      Everything you need, standardized
    </Typography>

    <Box
      sx={{
        display: 'grid',
        gap: { xs: 2, md: 3 },
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(3, 1fr)',
        },
      }}
    >
      {FEATURES.map(feature => (
        <Card
          key={feature.title}
          variant="outlined"
          sx={{
            height: '100%',
            borderRadius: 2,
            transition: 'box-shadow 0.2s ease, transform 0.2s ease',
            '&:hover': {
              boxShadow: 4,
              transform: 'translateY(-2px)',
            },
          }}
        >
          <CardContent sx={{ height: '100%' }}>
            <Avatar
              variant="rounded"
              sx={{
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                width: 44,
                height: 44,
                mb: 2,
              }}
            >
              {feature.icon}
            </Avatar>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
              {feature.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {feature.description}
            </Typography>
          </CardContent>
        </Card>
      ))}
    </Box>
  </Box>
);

const HowItWorksSection = () => (
  <Box sx={{ mb: { xs: 5, md: 7 } }}>
    <Typography
      variant="overline"
      sx={{ fontWeight: 700, letterSpacing: 1, color: 'text.secondary' }}
    >
      Process
    </Typography>
    <Typography variant="h4" component="h2" sx={{ fontWeight: 700, mb: 3 }}>
      How it works
    </Typography>

    <Box
      sx={{
        display: 'grid',
        gap: { xs: 2, md: 3 },
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(4, 1fr)',
        },
      }}
    >
      {STEPS.map((step, index) => (
        <Box key={step.title} sx={{ position: 'relative', height: '100%' }}>
          <Card
            variant="outlined"
            sx={{ height: '100%', borderRadius: 2, position: 'relative', pt: 1 }}
          >
            <CardContent>
              <Avatar
                sx={{
                  bgcolor: 'background.default',
                  color: 'primary.main',
                  border: theme => `2px solid ${theme.palette.primary.main}`,
                  width: 36,
                  height: 36,
                  mb: 2,
                  fontWeight: 700,
                  fontSize: '0.95rem',
                }}
              >
                {step.label}
              </Avatar>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
                {step.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {step.description}
              </Typography>
            </CardContent>
          </Card>
          {/* Connector line between steps on larger screens */}
          {index < STEPS.length - 1 && (
            <Box
              aria-hidden
              sx={{
                display: { xs: 'none', md: 'block' },
                position: 'absolute',
                top: 36,
                right: -16,
                width: 32,
                height: 2,
                bgcolor: 'divider',
              }}
            />
          )}
        </Box>
      ))}
    </Box>
  </Box>
);

const PrincipleSection = () => {
  const theme = useTheme();
  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 2,
        borderLeft: `4px solid ${theme.palette.primary.main}`,
        bgcolor: 'background.default',
      }}
    >
      <CardContent sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', p: { xs: 3, md: 4 } }}>
        <Box sx={{ color: 'primary.main', flexShrink: 0 }}>
          <QuoteIcon size={32} />
        </Box>
        <Box>
          <Typography
            variant="h6"
            component="p"
            sx={{ fontWeight: 700, mb: 1, fontSize: { xs: '1.05rem', md: '1.25rem' } }}
          >
            You build the service. The platform provides the foundation.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Use the approved templates to follow consistent engineering
            standards without setting up infrastructure and CI/CD from
            scratch.
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

const GettingStartedContent = () => (
  <Container maxWidth="lg" disableGutters sx={{ px: { xs: 2, sm: 3, md: 0 }, py: { xs: 2, md: 3 } }}>
    <HeroSection />
    <FeaturesSection />
    <Divider sx={{ mb: { xs: 5, md: 7 } }} />
    <HowItWorksSection />
    <PrincipleSection />
  </Container>
);

// ---------------------------------------------------------------------------
// Backstage wiring
// ---------------------------------------------------------------------------

const gettingStartedWidget = HomePageWidgetBlueprint.make({
  name: 'getting-started',
  params: {
    name: 'GettingStarted',
    title: '',
    description:
      'Self-service platform for creating standardized healthcare services',
    components: async () => ({
      Content: () => <GettingStartedContent />,
    }),
  },
});

const staticHomeLayout = HomePageLayoutBlueprint.make({
  name: 'static',
  params: {
    loader: async () => ({ widgets }) => (
      <>
        {widgets
          .filter(widget => widget.name === 'GettingStarted')
          .map(widget => (
            <Fragment key={widget.name}>{widget.component}</Fragment>
          ))}
      </>
    ),
  },
});

export const homeModule = createFrontendModule({
  pluginId: 'home',
  extensions: [gettingStartedWidget, staticHomeLayout],
});