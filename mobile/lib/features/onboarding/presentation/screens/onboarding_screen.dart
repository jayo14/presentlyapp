import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile/core/theme/app_colors.dart';
import 'package:mobile/shared/widgets/skeuo_button.dart';

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final PageController _pageController = PageController();
  int _currentPage = 0;

  final List<OnboardingData> _pages = [
    OnboardingData(
      title: 'GPS-Verified Attendance',
      description: 'Ensuring your presence where it matters most.',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAZufrBqqKAwn1w33MqcCoUcdi9B7Nschfo8_P3hldH_F_MPcgIvNjsIsIcAZYlonoi1wzpviKsYJf4vNvm41OkUHM3N7x_aA-IGMVO3o4FjsVyJW_McBq0qvv8Io-qJU1l6waKcTNxfhpccWb2Du81UUFnqE8WQOSKFNIJ6zYHwjA14IVM3S6Kg_Hd2Pb2Vzx415P2KxKzrfyDTNrrBa1JuKh41hf_9w1MnnnARdjYAKopYJiuGsz9YyCf-LvWGdsgixLA7jdf0QdK',
    ),
    OnboardingData(
      title: 'Real-time Class Validation',
      description: 'Instant updates for students and lecturers. Never miss a check-in with our live sync technology.',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB8PC0Ha6kyKs_KBSg76maklbiavgkuFCFV4UCFydryHo1XG8ZfcukrGzqgyXD5HNKsVOS9GPR6nBPX4gt8OfHY-g1YEGgzX2S-PjwRIjvR-1OoLQStVhrJj_2GXfUNO8QVCbXysMEAHGSXq_ZzVavoHzElC9WOsJCnJwmJFtTkkuo48i0IEZWI5-HoF3jFIF_NS9olsP_2a7niV3S1-iXcQKZ5z_vbimtiJKJyT1HBxWNBel1fdYyBYZmuNwlJ9VJ1Z8vcjlu958Uz',
    ),
    OnboardingData(
      title: 'No Proxy, No Stress',
      description: 'Secure, fraud-proof attendance tracking.',
      isShield: true,
    ),
    OnboardingData(
      title: 'Built for the Campus',
      description: 'Empowering the university community with transparency.',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB4z2iBpqB4a_UjcBEdgSPofKTWHXsnfQEqwSN8G1VKHi_Yu5QeQSGw-8-G2wLbB6hLztLk2qcRQY_S92aqnO9zfPVmHkkUD5EN4I1y4dUOevtbypMQjleKd9QjPYjMnoz7UNBdYKvTnlxh-Q6Ff6dmzgpVfShZQI5upyC1ApNGA7-2B7jxWoZ69sf8YNlBTC_LF-0AfYE8JJWfuV4Nn_xdoTG5YtozST_QlRuS1W2VrWfJ18YoFpWbxfnqyxW-vfc09XUzE09D0TIP',
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          PageView.builder(
            controller: _pageController,
            onPageChanged: (index) => setState(() => _currentPage = index),
            itemCount: _pages.length,
            itemBuilder: (context, index) {
              final page = _pages[index];
              return Column(
                children: [
                  Expanded(
                    flex: 6,
                    child: index == 2 ? _buildShieldVisual() : _buildImageVisual(page.imageUrl!),
                  ),
                  Expanded(
                    flex: 4,
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 24),
                      child: Column(
                        children: [
                          const SizedBox(height: 24),
                          Text(
                            page.title,
                            textAlign: TextAlign.center,
                            style: Theme.of(context).textTheme.headlineLarge,
                          ),
                          const SizedBox(height: 16),
                          Text(
                            page.description,
                            textAlign: TextAlign.center,
                            style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                                  color: AppColors.textLight.withOpacity(0.7),
                                ),
                          ),
                          const Spacer(),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: List.generate(
                              _pages.length,
                              (idx) => AnimatedContainer(
                                duration: const Duration(milliseconds: 300),
                                margin: const EdgeInsets.symmetric(horizontal: 4),
                                height: 8,
                                width: idx == _currentPage ? 24 : 8,
                                decoration: BoxDecoration(
                                  color: idx == _currentPage ? AppColors.primary : AppColors.outline,
                                  borderRadius: BorderRadius.circular(4),
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(height: 32),
                          SkeuoButton(
                            text: _currentPage == _pages.length - 1 ? 'Get Started' : 'Next',
                            isOutlined: _currentPage != _pages.length - 1,
                            onPressed: () {
                              if (_currentPage < _pages.length - 1) {
                                _pageController.nextPage(
                                  duration: const Duration(milliseconds: 500),
                                  curve: Curves.easeInOut,
                                );
                              } else {
                                context.go('/login');
                              }
                            },
                            suffixIcon: const Icon(Icons.arrow_forward),
                          ),
                          const SizedBox(height: 24),
                        ],
                      ),
                    ),
                  ),
                ],
              );
            },
          ),
          if (_currentPage < _pages.length - 1)
            Positioned(
              top: 48,
              right: 24,
              child: TextButton(
                onPressed: () => context.go('/login'),
                child: const Text(
                  'Skip',
                  style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.bold),
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildImageVisual(String url) {
    return Stack(
      fit: StackFit.expand,
      children: [
        Image.network(url, fit: BoxFit.cover),
        Container(
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
              colors: [
                Colors.transparent,
                AppColors.backgroundDark.withOpacity(0.8),
                AppColors.backgroundDark,
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildShieldVisual() {
    return Center(
      child: Container(
        width: 256,
        height: 256,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          color: const Color(0xFF2A2515),
          boxShadow: [
            BoxShadow(
              color: AppColors.primary.withOpacity(0.4),
              blurRadius: 40,
              spreadRadius: -10,
            ),
          ],
        ),
        child: const Icon(
          Icons.verified_user,
          color: AppColors.primary,
          size: 140,
        ),
      ),
    );
  }
}

class OnboardingData {
  final String title;
  final String description;
  final String? imageUrl;
  final bool isShield;

  OnboardingData({
    required this.title,
    required this.description,
    this.imageUrl,
    this.isShield = false,
  });
}
