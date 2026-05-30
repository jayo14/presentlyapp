import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';

import 'theme/app_tokens.dart';

void main() {
  runApp(const PresentlyApp());
}

class PresentlyApp extends StatelessWidget {
  const PresentlyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'Presently',
      theme: buildAppTheme(),
      home: const OnboardingScreen(),
    );
  }
}

class OnboardingSlide {
  const OnboardingSlide({
    required this.title,
    required this.description,
    required this.imageUrl,
  });

  final String title;
  final String description;
  final String imageUrl;
}

const onboardingSlides = <OnboardingSlide>[
  OnboardingSlide(
    title: 'GPS-Verified Attendance',
    description: 'Ensuring your presence where it matters most.',
    imageUrl:
        'https://github.com/user-attachments/assets/05ec0147-a91d-4081-b888-5684cd4d8192',
  ),
  OnboardingSlide(
    title: 'Real-time Class Validation',
    description: 'Instant updates for students and lecturers every check-in.',
    imageUrl:
        'https://github.com/user-attachments/assets/f55f0aa0-bd6e-4157-ba38-5b0777588245',
  ),
  OnboardingSlide(
    title: 'No Proxy, No Stress',
    description: 'Secure, fraud-proof attendance tracking built for trust.',
    imageUrl:
        'https://github.com/user-attachments/assets/8a4f227f-2eb1-465b-b471-ae5371dfa134',
  ),
  OnboardingSlide(
    title: 'Smart Campus Insights',
    description: 'Attendance intelligence that helps lecturers act faster.',
    imageUrl:
        'https://github.com/user-attachments/assets/f0c38637-472e-4f5f-90d6-568a534c34a4',
  ),
];

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final _pageController = PageController();
  int _currentIndex = 0;

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  void _onNext() {
    if (_currentIndex >= onboardingSlides.length - 1) {
      Navigator.of(context).pushReplacement(
        MaterialPageRoute<void>(
          builder: (_) => const ReadyScreen(),
        ),
      );
      return;
    }
    _pageController.nextPage(
      duration: const Duration(milliseconds: 300),
      curve: Curves.easeOutCubic,
    );
  }

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;

    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
          child: Column(
            children: [
              Expanded(
                child: PageView.builder(
                  controller: _pageController,
                  itemCount: onboardingSlides.length,
                  onPageChanged: (index) => setState(() => _currentIndex = index),
                  itemBuilder: (context, index) {
                    final slide = onboardingSlides[index];
                    return Column(
                      children: [
                        const SizedBox(height: 24),
                        Expanded(
                          child: Container(
                            width: double.infinity,
                            decoration: BoxDecoration(
                              borderRadius: BorderRadius.circular(AppRadii.xl),
                              gradient: const RadialGradient(
                                center: Alignment(0, -0.1),
                                radius: 1.1,
                                colors: [
                                  Color(0xFF253E4F),
                                  Color(0xFF101E29),
                                  Color(0xFF090E12),
                                ],
                              ),
                              boxShadow: AppShadows.card,
                            ),
                            child: Padding(
                              padding: const EdgeInsets.all(8),
                              child: ClipRRect(
                                borderRadius: BorderRadius.circular(AppRadii.lg),
                                child: CachedNetworkImage(
                                  imageUrl: slide.imageUrl,
                                  fit: BoxFit.cover,
                                  placeholder: (context, url) => Container(
                                    color: AppColors.surfaceSoft,
                                    alignment: Alignment.center,
                                    child: const SizedBox(
                                      width: 34,
                                      height: 34,
                                      child: CircularProgressIndicator(
                                        strokeWidth: 3,
                                        color: AppColors.accent,
                                      ),
                                    ),
                                  ),
                                  errorWidget: (context, url, error) => Semantics(
                                    label: 'Image failed to load',
                                    child: Container(
                                      color: AppColors.surfaceSoft,
                                      alignment: Alignment.center,
                                      child: const Icon(
                                        Icons.broken_image_outlined,
                                        color: AppColors.accent,
                                        size: 82,
                                      ),
                                    ),
                                  ),
                                ),
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(height: 32),
                        Text(
                          slide.title,
                          textAlign: TextAlign.center,
                          maxLines: 2,
                          style: textTheme.titleLarge,
                        ),
                        const SizedBox(height: 12),
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 16),
                          child: Text(
                            slide.description,
                            textAlign: TextAlign.center,
                            style: textTheme.bodyLarge,
                          ),
                        ),
                      ],
                    );
                  },
                ),
              ),
              const SizedBox(height: 24),
              _Paginator(currentIndex: _currentIndex, length: onboardingSlides.length),
              const SizedBox(height: 28),
              _SkeuomorphicButton(
                label: _currentIndex == onboardingSlides.length - 1
                    ? 'Get Started'
                    : 'Next',
                onTap: _onNext,
              ),
              const SizedBox(height: 20),
            ],
          ),
        ),
      ),
    );
  }
}

class ReadyScreen extends StatelessWidget {
  const ReadyScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Semantics(
          label: 'Onboarding complete',
          header: true,
          child: Text(
            'Onboarding complete',
            style: Theme.of(context).textTheme.headlineMedium,
            textAlign: TextAlign.center,
          ),
        ),
      ),
    );
  }
}

class _Paginator extends StatelessWidget {
  const _Paginator({
    required this.currentIndex,
    required this.length,
  });

  final int currentIndex;
  final int length;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: List.generate(length, (index) {
        final isActive = index == currentIndex;
        return AnimatedContainer(
          duration: const Duration(milliseconds: 180),
          margin: const EdgeInsets.symmetric(horizontal: 7),
          width: isActive ? 20 : 14,
          height: isActive ? 20 : 14,
          decoration: BoxDecoration(
            color: isActive ? AppColors.accent : AppColors.dotInactive,
            shape: BoxShape.circle,
            boxShadow: isActive
                ? const [
                    BoxShadow(
                      color: Color(0xAAE0B611),
                      blurRadius: 12,
                      spreadRadius: 1,
                    ),
                  ]
                : null,
          ),
        );
      }),
    );
  }
}

class _SkeuomorphicButton extends StatelessWidget {
  const _SkeuomorphicButton({
    required this.label,
    required this.onTap,
  });

  final String label;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;

    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(38),
        gradient: const LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [
            Color(0xFF3D320E),
            Color(0xFF241D08),
          ],
        ),
        border: Border.all(
          color: AppColors.accent,
          width: 3,
        ),
        boxShadow: AppShadows.button,
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(38),
          onTap: onTap,
          child: SizedBox(
            width: double.infinity,
            height: 88,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  label,
                  style: textTheme.labelLarge?.copyWith(color: AppColors.accent),
                ),
                const SizedBox(width: 10),
                const Icon(Icons.arrow_forward, color: AppColors.accent, size: 34),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
