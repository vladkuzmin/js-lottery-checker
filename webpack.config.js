module.exports = {
    mode: 'none',
    watch: true,
    devtool: "#cheap-module-eval-source-map",
    output: {
        filename: 'app.js',
    },
    module: {
        rules: [{
            test: /\.(js|jsx)$/,
            exclude: /(node_modules)/,
            use: {
                loader: 'babel-loader',
                options: {
                    presets: ['@babel/preset-env']
                }
            }
        }, ],
    },
};