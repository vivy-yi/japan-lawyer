#!/usr/bin/env python3
"""
增强AI法律和AI CRM页面，添加一站式服务特色
"""

import os
import re

# AI法律页面增强内容
AI_LEGAL_ENHANCEMENT = '''<!-- 一站式服务特色展示 -->
    <section class="one-stop-features">
        <div class="ai-container">
            <div class="one-stop-feature">
                <div class="feature-icon">⚖️</div>
                <h3 class="feature-title">全方位法律支持</h3>
                <p class="feature-description">从合同审查到诉讼代理，提供完整法律生命周期服务</p>
                <div class="feature-stats">
                    <div class="stat-item">
                        <span class="stat-number">24/7</span>
                        <span class="stat-label">在线支持</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">100+</span>
                        <span class="stat-label">法律专家</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">99.9%</span>
                        <span class="stat-label">成功率</span>
                    </div>
                </div>
            </div>

            <div class="one-stop-feature">
                <div class="feature-icon">🤖</div>
                <h3 class="feature-title">AI智能分析</h3>
                <p class="feature-description">运用深度学习技术，精准识别法律风险点，提供智能化解决方案</p>
                <div class="feature-stats">
                    <div class="stat-item">
                        <span class="stat-number">3分钟</span>
                        <span class="stat-label">分析速度</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">95%</span>
                        <span class="stat-label">准确率</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">∞</span>
                        <span class="stat-label">学习能力</span>
                    </div>
                </div>
            </div>

            <div class="one-stop-feature">
                <div class="feature-icon">📊</div>
                <h3 class="feature-title">数据安全保障</h3>
                <p class="feature-description">银行级加密保护，严格的数据隔离，确保您的信息绝对安全</p>
                <div class="feature-stats">
                    <div class="stat-item">
                        <span class="stat-number">256位</span>
                        <span class="stat-label">加密</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">ISO</span>
                        <span class="stat-label">认证</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">100%</span>
                        <span class="stat-label">隐私保护</span>
                    </div>
                </div>
            </div>

            <div class="one-stop-feature">
                <div class="feature-icon">🌐</div>
                <h3 class="feature-title">跨境法律服务</h3>
                <p class="feature-description">熟悉国际商法和各国家法律体系，提供全球化法律服务支持</p>
                <div class="feature-stats">
                    <div class="stat-item">
                        <span class="stat-number">50+</span>
                        <span class="stat-label">国家覆盖</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">15种</span>
                        <span class="stat-label">语言支持</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">24h</span>
                        <span class="stat-label">快速响应</span>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- 一站式服务流程 -->
    <section class="one-stop-process">
        <div class="ai-container">
            <h2 class="process-title">一站式服务流程</h2>
            <div class="process-steps">
                <div class="process-step">
                    <div class="step-number">1</div>
                    <h4 class="step-title">需求分析</h4>
                    <p class="step-description">AI智能识别法律需求，提供精准服务匹配</p>
                </div>

                <div class="process-step">
                    <div class="step-number">2</div>
                    <h4 class="step-title">方案制定</h4>
                    <p class="step-description">专业团队制定个性化解决方案</p>
                </div>

                <div class="process-step">
                    <div class="step-number">3</div>
                    <h4 class="step-title">执行服务</h4>
                    <p class="step-description">高效执行，实时跟踪服务进度</p>
                </div>

                <div class="process-step">
                    <div class="step-number">4</div>
                    <h4 class="step-title">质量保证</h4>
                    <p class="step-description">持续跟进，确保服务质量</p>
                </div>
            </div>
        </div>
    </section>'''

# AI CRM页面增强内容
AI_CRM_ENHANCEMENT = '''<!-- 一站式CRM服务特色 -->
    <section class="one-stop-features">
        <div class="ai-container">
            <div class="one-stop-feature">
                <div class="feature-icon">🎯</div>
                <h3 class="feature-title">客户全生命周期管理</h3>
                <div class="real-time-status">
                    <div class="status-dot"></div>
                    <span>AI实时监控</span>
                </div>
                <p class="feature-description">从潜客获取到客户维系，提供完整的客户管理闭环</p>
                <div class="feature-stats">
                    <div class="stat-item">
                        <span class="stat-number">360°</span>
                        <span class="stat-label">客户视图</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">85%</span>
                        <span class="stat-label">转化提升</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">30天</span>
                        <span class="stat-label">留存率</span>
                    </div>
                </div>
            </div>

            <div class="one-stop-feature">
                <div class="feature-icon">🧠</div>
                <h3 class="feature-title">AI智能预测</h3>
                <div class="real-time-status">
                    <div class="status-dot"></div>
                    <span>实时分析</span>
                </div>
                <p class="feature-description">机器学习算法预测客户行为，精准识别销售机会</p>
                <div class="feature-stats">
                    <div class="stat-item">
                        <span class="stat-number">92%</span>
                        <span class="stat-label">预测准确率</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">4x</span>
                        <span class="stat-label">销售效率</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">实时</span>
                        <span class="stat-label">数据更新</span>
                    </div>
                </div>
            </div>

            <div class="one-stop-feature">
                <div class="feature-icon">📱</div>
                <h3 class="feature-title">数据分析洞察</h3>
                <div class="real-time-status">
                    <div class="status-dot"></div>
                    <span>自动报告</span>
                </div>
                <p class="feature-description">深度业务洞察，可视化数据分析，智能报表生成</p>
                <div class="feature-stats">
                    <div class="stat-item">
                        <span class="stat-number">100+</span>
                        <span class="stat-label">分析维度</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">5秒</span>
                        <span class="stat-label">报告生成</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">实时</span>
                        <span class="stat-label">数据同步</span>
                    </div>
                </div>
            </div>

            <div class="one-stop-feature">
                <div class="feature-icon">🔄</div>
                <h3 class="feature-title">流程自动化</h3>
                <div class="real-time-status">
                    <div class="status-dot"></div>
                    <span>智能优化</span>
                </div>
                <p class="feature-description">自动化营销流程，智能工作流设计，大幅提升效率</p>
                <div class="feature-stats">
                    <div class="stat-item">
                        <span class="stat-number">70%</span>
                        <span class="stat-label">时间节省</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">100%</span>
                        <span class="stat-label">执行准确</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">24/7</span>
                        <span class="stat-label">自动运行</span>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- 一站式CRM核心功能 -->
    <section class="one-stop-process">
        <div class="ai-container">
            <h2 class="process-title">核心功能模块</h2>
            <div class="process-steps">
                <div class="process-step">
                    <div class="step-number">1</div>
                    <h4 class="step-title">智能获客</h4>
                    <p class="step-description">AI驱动的多渠道获客，精准定位目标客户</p>
                </div>

                <div class="process-step">
                    <div class="step-number">2</div>
                    <h4 class="step-title">客户管理</h4>
                    <p class="step-description">统一客户档案，全渠道交互记录，实时客户画像</p>
                </div>

                <div class="process-step">
                    <div class="step-number">3</div>
                    <h4 class="step-title">销售管理</h4>
                    <p class="step-description">AI辅助销售决策，智能推荐最佳跟进策略</p>
                </div>

                <div class="process-step">
                    <div class="step-number">4</div>
                    <h4 class="step-title">数据分析</h4>
                    <p class="step-description">全面业绩分析，AI预测销售趋势，智能建议优化</p>
                </div>

                <div class="process-step">
                    <div class="step-number">5</div>
                    <h4 class="step-title">客户维系</h4>
                    <p class="step-description">智能客户分层，个性化服务推荐，提升客户满意度</p>
                </div>
            </div>
        </div>
    </section>'''

def enhance_ai_legal_page():
    """增强AI法律页面"""
    file_path = 'html/ailegal.html'

    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # 备份原文件
        backup_path = file_path.replace('.html', '.one-stop.html.backup')
        with open(backup_path, 'w', encoding='utf-8') as f:
            f.write(content)

        # 更新页面标题区域
        content = re.sub(
            r'(<h1 class="page-title">.*?<\/h1>.*?<p class="page-subtitle">.*?<\/p>)',
            '''<h1 class="page-title">⚖️ AI一站式法律服务平台</h1>
                <p class="page-subtitle">智能化全方位法律解决方案，提供从咨询到执行的完整法律服务链条</p>
                <span class="ai-badge">一站式服务</span>''',
            content,
            flags=re.DOTALL
        )

        # 在页面内容区域前插入一站式服务特色
        content = re.sub(
            r'(<div class="container">.*?)(\n\s*<!-- 搜索功能 -->)',
            f'\\1\n{AI_LEGAL_ENHANCEMENT}\\2',
            content,
            flags=re.DOTALL
        )

        # 更新CSS引入，添加一站式服务样式
        content = re.sub(
            r'(<link rel="stylesheet" href="css/modern-ai-pages.css">)',
            '\\1\n    <link rel="stylesheet" href="css/one-stop-services.css">',
            content
        )

        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)

        print(f"✅ AI法律页面增强成功: {file_path}")
        return True

    except Exception as e:
        print(f"❌ AI法律页面增强失败: {str(e)}")
        return False

def enhance_ai_crm_page():
    """增强AI CRM页面"""
    file_path = 'html/aicrm.html'

    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # 备份原文件
        backup_path = file_path.replace('.html', '.one-stop.html.backup')
        with open(backup_path, 'w', encoding='utf-8') as f:
            f.write(content)

        # 更新页面标题区域
        content = re.sub(
            r'(<h1 class="page-title">.*?<\/h1>.*?<p class="page-subtitle">.*?<\/p>)',
            '''<h1 class="page-title">🤖 AI一站式CRM管理系统</h1>
                <p class="page-subtitle">智能化客户关系管理平台，提供从获客到留存的全链路CRM解决方案</p>
                <span class="ai-badge">全链路管理</span>''',
            content,
            flags=re.DOTALL
        )

        # 在页面内容区域前插入一站式CRM特色
        content = re.sub(
            r'(<div class="container">.*?)(\n\s*<!--)',
            f'\\1\n{AI_CRM_ENHANCEMENT}\\2',
            content,
            flags=re.DOTALL
        )

        # 更新CSS引入
        content = re.sub(
            r'(<link rel="stylesheet" href="css/modern-ai-pages.css">)',
            '\\1\n    <link rel="stylesheet" href="css/one-stop-services.css">',
            content
        )

        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)

        print(f"✅ AI CRM页面增强成功: {file_path}")
        return True

    except Exception as e:
        print(f"❌ AI CRM页面增强失败: {str(e)}")
        return False

def main():
    """主函数"""
    print("🚀 开始增强AI法律和AI CRM页面，突出一站式服务特色...")

    success_count = 0

    if enhance_ai_legal_page():
        success_count += 1

    if enhance_ai_crm_page():
        success_count += 1

    print(f"\n📊 增强完成: {success_count}/2 个页面成功更新")
    print("💡 备份文件已保存为 .one-stop.html.backup 格式")

if __name__ == '__main__':
    main()