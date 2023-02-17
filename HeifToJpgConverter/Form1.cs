using ImageMagick;

namespace HeifToJpgConverter
{
    public partial class Form1 : Form
    {
        public Form1()
        {
            InitializeComponent();
        }

        private void BtnSelectOriginFile_Click(object sender, EventArgs e)
        {
            var fileContent = string.Empty;
            var filePath = string.Empty;

            using var openFileDialog = new OpenFileDialog();
            openFileDialog.InitialDirectory = "c:\\";
            openFileDialog.Filter = "heic files (*.heic)|*.heic|heif files (*.heif)|*.heif";
            openFileDialog.FilterIndex = 2;
            openFileDialog.RestoreDirectory = true;

            if (openFileDialog.ShowDialog() == DialogResult.OK)
            {
                filePath = openFileDialog.FileName;
                txtOriginFile.Text = filePath;
                MessageBox.Show("File Content at path: " + filePath, "Selected File", MessageBoxButtons.OK);
                return;
            }
            
            MessageBox.Show("You need to select a file to be converted in order to proceed with the conversion", "Warning", MessageBoxButtons.OK, MessageBoxIcon.Warning);
        }

        private void BtnSelectDestinationFolder_Click(object sender, EventArgs e)
        {
            var folderPath = string.Empty;

            using var folderBrowser= new FolderBrowserDialog();
            folderBrowser.InitialDirectory = "c:\\";

            if (folderBrowser.ShowDialog() == DialogResult.OK)
            {
                folderPath = folderBrowser.SelectedPath;
                txtDestinationFolder.Text = folderPath;
                MessageBox.Show("File Content at path: " + folderPath, "Selected folder", MessageBoxButtons.OK);
                return;
            }

            MessageBox.Show("You need to select a destination folder in order to proceed with the conversion", "Warning", MessageBoxButtons.OK, MessageBoxIcon.Warning);
        }

        private void BtnClear_Click(object sender, EventArgs e)
        {
            txtDestinationFolder.Text = string.Empty;
            txtOriginFile.Text = string.Empty;
        }

        private void BtnClose_Click(object sender, EventArgs e)
        {
            DialogResult result = MessageBox.Show("Do you really want to exit?", "Close the App?", MessageBoxButtons.YesNo);
            if (result == DialogResult.Yes)
            {
                Environment.Exit(0);
            }
            else
            {
                return;
            }
        }

        private void BtnConvert_Click(object sender, EventArgs e)
        {
            using var magickImage = new MagickImage(txtOriginFile.Text);
            magickImage.Format = MagickFormat.Jpg;
            magickImage.Write(@"" + txtDestinationFolder.Text + "\\ConvertedImage.jpg");
        }

        private void Form1_Load(object sender, EventArgs e)
        {
            //txtOriginFile.Text = @"C:\Users\Joffre\OneDrive\Particular\Imagens\Imagens da Câmera\2023\02\20230217_085445749_iOS.heic";
            //txtDestinationFolder.Text = @"C:\Users\Joffre\Desktop";
        }
    }
}