import chalk from 'chalk';
const command = {
    name: 'exit',
    description: 'Exit OpenShiba',
    usage: '/exit',
    handler(_args, ctx) {
        console.log('');
        console.log(chalk.hex('#e8873a')('👋 Goodbye from OpenShiba! May the Shiba be with you!'));
        console.log('');
        ctx.exit();
    },
};
export default command;
//# sourceMappingURL=exit.js.map